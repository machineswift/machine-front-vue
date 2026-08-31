<template>
  <el-dialog
    v-model="state.visible"
    title="修改权限"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    class="permission-edit-dialog"
    width="80%"
    top="8vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #default>
        <el-form label-width="80px" label-position="right" class="permission-form">
          <div class="form-inputs">
            <el-form-item label="关键字:" class="keyword-input">
              <el-input v-model="state.permissionQuery" placeholder="请输入名称或编码" clearable @input="onPermissionQueryChanged" />
            </el-form-item>
          </div>

          <div class="permission-tree-container">
            <div class="tree-title">权限选择</div>
            <el-tree-v2
              ref="permissionTreeRef"
              :data="state.permissionTreeOptions"
              :props="state.permissionProps"
              :height="540"
              show-checkbox
              :expand-on-click-node="true"
              :check-on-click-node="false"
              :check-on-click-leaf="false"
              :filter-method="permissionFilterMethod"
              :default-checked-keys="state.defaultPermissionCheckedKeys"
              :default-expanded-keys="state.defaultPermissionExpandedKeys"
              @check="(node: TreeNodeData, data: { checkedNodes: TreeNodeData[] }) => handlePermissionCheckChange(data.checkedNodes)"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <div>
                    <span>
                      <el-tag :type="getResourceTypeTag(data.resourceType)">
                        {{ data.resourceType ? enumStore.getEnumLabel(DICT_IAM_PERMISSION_RESOURCE_TYPE, data.resourceType) : '-' }}
                      </el-tag>
                    </span>
                    <span class="permission-name">{{ node.label }}</span>
                    <span class="permission-code">({{ data.code }})</span>
                  </div>

                  <div>
                    <span v-if="data?.resourceType === 'MENU'" class="checked-badge">
                      <el-button size="small" type="warning" @click.stop.prevent="handleDrawerOpen(data)">数据权限</el-button>
                    </span>
                  </div>
                </span>
              </template>
            </el-tree-v2>
          </div>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE_PERMISSION']">
        确认
      </el-button>
    </template>
  </el-dialog>

  <BIamRoleEditPermissionDrawer
    v-model="state.drawer"
    :node="state.currentMenuPermissionNode!"
    :organization-type-options="organizationTypeOptions"
    :organization-tree-options-map="state.organizationTreeOptionsMap"
    :data-permission-rule-map="state.dataPermissionRuleMap"
    @update:data-permission-rule-map="handleDataPermissionRuleMapUpdate"
  />
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage, type ElTreeV2, type TreeNodeData } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_ORG_TYPE, DICT_IAM_PERMISSION_RESOURCE_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { BIamRoleApi } from '@/modules/biam/role/api/BIamRole.api'
  import { BIamPermissionApi } from '@/modules/biam/permission/api/BIamPermission.api'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import type { DataPermissionRuleDto } from '@/shared/types/CommonIam.type'
  import type { BIamPermissionTreeExpandResponseVo } from '@/modules/biam/permission/type/BIamPermission.type'
  import type { BIamRoleDetailResponseVo } from '@/modules/biam/role/type/BIamRole.type'
  import type { BIamOrganizationSimpleTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'
  import BIamRoleEditPermissionDrawer from '@/modules/biam/role/BIamRoleEditPermissionDrawer.vue'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    roleId: { type: String, required: true }
  })

  const RESOURCE_TYPE_TAG_MAP: Record<string, string> = {
    APP: 'primary',
    MODULE: 'success',
    DIRECTORY: 'info',
    MENU: 'warning',
    BUTTON: 'danger'
  }

  const emit = defineEmits(['update:modelValue', 'success'])
  const enumStore = useDictionaryEnumStore()
  const { options: organizationTypeOptions, load: loadOrganizationTypeOptions } = useEnumOptions(DICT_IAM_ORG_TYPE)
  const permissionTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    drawer: false,

    //权限树
    permissionQuery: '',
    permissionTreeOptions: [] as BIamPermissionTreeExpandResponseVo[],
    defaultPermissionCheckedKeys: [] as string[],
    defaultPermissionExpandedKeys: [] as string[],
    computeSelectedPermissionKeys: [] as string[],

    //组织树
    organizationTreeOptionsMap: new Map<string, BIamOrganizationSimpleTreeResponseVo[]>(),

    //当前选中的权限的节点
    currentMenuPermissionNode: null as BIamPermissionTreeExpandResponseVo | null,

    //菜单数据权限信息
    dataPermissionRuleMap: new Map<string, DataPermissionRuleDto[]>(),
    permissionProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  const getResourceTypeTag = (type?: string | null) => {
    if (!type) return 'info'
    // 枚举 code 与传入 type 一致，直接按 tag map 取类型即可，无需依赖枚举字典是否已加载
    return RESOURCE_TYPE_TAG_MAP[type] || 'info'
  }

  const onPermissionQueryChanged = () => {
    if (!permissionTreeRef.value) return

    const query = state.permissionQuery.trim()
    permissionTreeRef.value.filter(query)

    if (query === '') {
      permissionTreeRef.value.setExpandedKeys(state.defaultPermissionExpandedKeys)
    }
  }

  const permissionFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || node.code?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handlePermissionCheckChange = (checkedNodes: TreeNodeData[]) => {
    if (checkedNodes && checkedNodes.length > 0) {
      const checkedNodeIds: string[] = checkedNodes.map(r => r.id)
      const menuIds = []
      const allParentNodes: BIamPermissionTreeExpandResponseVo[] = TreeDataUtil.getAllParentNodes(state.permissionTreeOptions, checkedNodeIds)
      for (const node of allParentNodes) {
        if (node.resourceType === 'MENU') {
          menuIds.push(node.id)
        }
      }
      state.computeSelectedPermissionKeys = [...new Set([...checkedNodeIds, ...menuIds])]
    } else {
      state.computeSelectedPermissionKeys = []
    }
  }

  const handleDrawerOpen = (node: BIamPermissionTreeExpandResponseVo) => {
    if (state.computeSelectedPermissionKeys.includes(node.id)) {
      state.currentMenuPermissionNode = node
      state.drawer = true
    } else {
      ElMessage.warning('请先选中该菜单或菜单下面的按钮，再设置数据权限')
    }
  }

  const handleDataPermissionRuleMapUpdate = (newMap: Map<string, DataPermissionRuleDto[]>) => {
    state.dataPermissionRuleMap = newMap
  }

  const fetchData = async () => {
    try {
      state.loading = true

      //枚举数据
      await loadOrganizationTypeOptions()
      await enumStore.getEnumDataAsync(DICT_IAM_PERMISSION_RESOURCE_TYPE)

      //权限tree初始化
      const permissionTreeData: BIamPermissionTreeExpandResponseVo[] = (await BIamPermissionApi.treeExpand({ id: 'machine' })).children ?? []
      state.permissionTreeOptions = permissionTreeData

      // 展开前两层节点
      const expandedKeys: string[] = []
      permissionTreeData.forEach(item => {
        expandedKeys.push(item.id)
        if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
            expandedKeys.push(child.id)
          })
        }
      })
      state.defaultPermissionExpandedKeys = expandedKeys

      //初始化状态数据
      const roleDetailResponse: BIamRoleDetailResponseVo = await BIamRoleApi.detail({ id: props.roleId })
      const permissionIdSet: string[] = roleDetailResponse.permissionIdSet
      const dataPermissionRuleMap: Map<string, DataPermissionRuleDto[]> = roleDetailResponse.dataPermissionRuleMap

      //初始化权限树默认选中的节点
      if (permissionIdSet?.length > 0) {
        state.computeSelectedPermissionKeys = permissionIdSet
        state.defaultPermissionCheckedKeys = TreeDataUtil.getBottomLevelIds(state.permissionTreeOptions, permissionIdSet)
      }

      //初始化菜单数据权限信息
      state.dataPermissionRuleMap = dataPermissionRuleMap instanceof Map ? new Map(dataPermissionRuleMap) : new Map(Object.entries(dataPermissionRuleMap || {}))

      //初始化组织树树数据
      await Promise.all(
        organizationTypeOptions.value.map(async option => {
          const organizationTreeRes = await BIamOrganizationApi.treeSimple({ type: option.code })
          state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
        })
      )
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.permissionQuery = ''
    state.permissionTreeOptions = []
    state.defaultPermissionCheckedKeys = []
    state.defaultPermissionExpandedKeys = []
    state.computeSelectedPermissionKeys = []

    // 清理组织树相关数据
    state.organizationTreeOptionsMap.clear()

    state.currentMenuPermissionNode = null

    // 清空数据权限规则映射
    state.dataPermissionRuleMap.clear()

    // 关闭抽屉（如果打开）
    state.drawer = false

    state.loading = false
    state.submitting = false
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true

      // 转换 Map 为普通对象
      const convertedRuleMap = Array.from(state.dataPermissionRuleMap.entries()).reduce(
        (acc, [menuId, rules]) => {
          acc[menuId] = rules.map(rule => ({
            ...rule,
            organizationNodeMap: rule.organizationNodeMap instanceof Map ? Object.fromEntries(rule.organizationNodeMap) : rule.organizationNodeMap || {}
          })) as unknown as DataPermissionRuleDto[]
          return acc
        },
        {} as Record<string, DataPermissionRuleDto[]>
      )

      await BIamRoleApi.updatePermission({
        id: props.roleId,
        permissionIdSet: state.computeSelectedPermissionKeys || [],
        // Map 转普通对象后发送（JSON 序列化 Map 会丢失数据）
        dataPermissionRuleMap: convertedRuleMap as unknown as Parameters<typeof BIamRoleApi.updatePermission>[0]['dataPermissionRuleMap']
      })
      ElMessage.success('更新角色权限成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('更新角色权限失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.roleId],
    async ([modelValue, roleId]) => {
      if (modelValue && roleId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .permission-form {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .keyword-input {
      width: 300px;
    }

    .form-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  }

  .permission-tree-container {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--el-fill-color-light);

    .tree-title {
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      .permission-name {
        font-weight: bold;
        margin-left: 8px;
        font-size: 14px;
      }

      .permission-code {
        margin-left: 8px;
        color: #999;
        font-size: 12px;
      }

      .checked-badge {
        margin-left: 10px;
      }
    }
  }
</style>
