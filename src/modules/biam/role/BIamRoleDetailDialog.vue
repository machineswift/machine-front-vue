<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="角色详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-tabs type="border-card" v-loading="state.loading" class="el-tabs-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" class="el-main-tab-pane">
        <el-form :model="state.detailData" label-width="100px">
          <el-divider content-position="left">基本信息</el-divider>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="角色名称">
                <el-input :model-value="state.detailData.name || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色编码">
                <el-input :model-value="state.detailData.code || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="角色类型">
                <el-input :model-value="state.detailData.type ? enumStore.getEnumLabel(DICT_IAM_ROLE_TYPE, state.detailData.type) : '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-input :model-value="state.detailData.status ? enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) : '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="默认角色">
                <el-tag :type="state.detailData.defaultRole ? 'success' : 'info'">
                  {{ state.detailData.defaultRole ? '是' : '否' }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联用户数">
                <el-input :model-value="state.detailData.userNumber ?? 0" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="数据权限范围">
            <el-input
              :model-value="
                state.detailData.dataPermissionRule?.scopeCode
                  ? enumStore.getEnumLabel(DICT_IAM_DATA_PERMISSION_SCOPE_TYPE, state.detailData.dataPermissionRule.scopeCode)
                  : '无'
              "
              disabled
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="描述" v-if="state.detailData.description">
            <el-input :model-value="state.detailData.description" type="textarea" :rows="3" disabled />
          </el-form-item>

          <el-divider content-position="left">操作信息</el-divider>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="创建人">
                <el-input :model-value="state.detailData.createName || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新人">
                <el-input :model-value="state.detailData.updateName || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 数据权限标签页 -->
      <el-tab-pane label="数据权限" v-if="state.detailData.dataPermissionRule && state.ruleDataReady" class="el-main-tab-pane">
        <div class="data-permission-detail">
          <el-form-item label="数据权限范围" prop="type">
            <el-radio-group v-model="state.detailData.dataPermissionRule.scopeCode" disabled>
              <el-radio v-for="option in dataPermissionScopeTypes" :key="option.code" :value="option.code">
                {{ option.message }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-tabs v-if="state.detailData.dataPermissionRule.scopeCode === 'CUSTOM'" type="border-card" class="data-permission-tabs">
            <el-tab-pane v-for="option in organizationTypeOptions" :key="option.code" :label="option.message">
              <div class="tab-header">
                <el-input v-model="state.organizationQueryMap[option.code]" placeholder="请输入关键字" clearable class="search-input" :disabled="true" />
                <el-checkbox v-model="state.organizationCascadeSelectionMap[option.code]" :disabled="true">父子联动</el-checkbox>
              </div>
              <el-tree-v2
                v-if="state.ruleDataReady"
                :data="state.organizationTreeOptionsMap.get(option.code)"
                :props="state.organizationProps"
                :height="520"
                show-checkbox
                node-key="id"
                :check-strictly="!state.organizationCascadeSelectionMap[option.code]"
                :default-expanded-keys="state.organizationDefaultExpandedKeysMap.get(option.code) || []"
                :default-checked-keys="state.organizationDefaultCheckedKeysMap.get(option.code) || []"
                :disabled="true"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span>{{ node.label }}</span>
                    <span v-if="isDataPermissionNodeChecked(option.code, data.id)" class="checked-badge">
                      <el-tag size="small" type="success">已选</el-tag>
                    </span>
                  </span>
                </template>
              </el-tree-v2>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>

      <el-tab-pane label="权限信息" v-if="state.permissionDataReady" class="el-main-tab-pane">
        <div class="permission-tree-container">
          <div class="tree-title">权限列表</div>
          <el-tree-v2
            :data="state.permissionTreeOptions"
            :props="state.permissionProps"
            :height="640"
            :default-checked-keys="state.defaultPermissionCheckedKeys"
            :default-expanded-keys="state.defaultPermissionExpandedKeys"
            :show-checkbox="true"
            :disabled="true"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <div>
                  <span>
                    <el-tag :type="getResourceTypeTag(data.resourceType)">
                      {{ enumStore.getEnumLabel(DICT_IAM_PERMISSION_RESOURCE_TYPE, data.resourceType) }}
                    </el-tag>
                  </span>
                  <span class="permission-name">{{ node.label }}</span>
                  <span class="permission-code">({{ data.code }})</span>
                </div>
                <div>
                  <span v-if="data?.resourceType === 'MENU'">
                    <el-button size="small" type="warning" @click.stop.prevent="handleDrawerOpen(data)">数据权限</el-button>
                  </span>
                </div>
              </span>
            </template>
          </el-tree-v2>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>

    <BIamRoleEditPermissionDrawer
      v-model="state.drawer"
      :node="state.currentMenuPermissionNode!"
      :organization-type-options="organizationTypeOptions"
      :organization-tree-options-map="state.organizationTreeOptionsMap"
      :data-permission-rule-map="state.detailData.dataPermissionRuleMap"
      mode="view"
    />
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive } from 'vue'
  import { BIamRoleApi } from '@/modules/biam/role/api/BIamRole.api'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import { BIamPermissionApi } from '@/modules/biam/permission/api/BIamPermission.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import {
    DICT_STATUS,
    DICT_IAM_ROLE_TYPE,
    DICT_IAM_ORG_TYPE,
    DICT_IAM_DATA_PERMISSION_SCOPE_TYPE,
    DICT_IAM_PERMISSION_RESOURCE_TYPE
  } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamOrganizationSimpleTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'
  import type { BIamPermissionTreeExpandResponseVo } from '@/modules/biam/permission/type/BIamPermission.type'
  import BIamRoleEditPermissionDrawer from '@/modules/biam/role/BIamRoleEditPermissionDrawer.vue'
  import type { DataPermissionRuleDto, DataPermissionRuleOrganizationNodeDto } from '@/shared/types/CommonIam.type'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    roleId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])
  const enumStore = useDictionaryEnumStore()

  const { options: dataPermissionScopeTypes, load: loadDataPermissionScopeTypes } = useEnumOptions(DICT_IAM_DATA_PERMISSION_SCOPE_TYPE)
  const { options: organizationTypeOptions, load: loadOrganizationTypeOptions } = useEnumOptions(DICT_IAM_ORG_TYPE)

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    ruleDataReady: false,
    permissionDataReady: false,
    drawer: false,

    //组织树
    organizationTreeOptionsMap: new Map<string, BIamOrganizationSimpleTreeResponseVo[]>(),
    //组织树（数据权限）
    organizationQueryMap: {} as Record<string, string>,
    organizationCascadeSelectionMap: {} as Record<string, boolean>,
    organizationDefaultCheckedKeysMap: new Map<string, string[]>(),
    organizationDefaultExpandedKeysMap: new Map<string, string[]>(),
    //权限树
    permissionTreeOptions: [] as BIamPermissionTreeExpandResponseVo[],
    defaultPermissionCheckedKeys: [] as string[],
    defaultPermissionExpandedKeys: [] as string[],

    //权限树当前选中状态
    currentMenuPermissionNode: null as BIamPermissionTreeExpandResponseVo | null,

    //菜单数据权限信息
    computeSelectedPermissionKeys: [] as string[],

    permissionProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    detailData: {
      id: '',
      type: '',
      name: '',
      code: '',
      status: '',
      defaultRole: false,
      userNumber: 0,
      description: '',
      createTime: 0,
      updateTime: 0,
      createName: '',
      updateName: '',
      dataPermissionRule: {
        functionCode: 'DEFAULT',
        scopeCode: 'ORG_AND_SUB',
        organizationNodeMap: {}
      },
      permissionIdSet: [] as string[],
      dataPermissionRuleMap: new Map<string, DataPermissionRuleDto[]>()
    }
  })

  const getResourceTypeTag = (type?: string | null) => {
    const RESOURCE_TYPE_TAG_MAP: Record<string, string> = {
      APP: 'primary',
      MODULE: 'success',
      DIRECTORY: 'info',
      MENU: 'warning',
      BUTTON: 'danger'
    }
    // 枚举 code 与传入 type 一致，直接按 tag map 取类型即可，无需依赖枚举字典是否已加载
    return (type && RESOURCE_TYPE_TAG_MAP[type]) || 'info'
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 检查节点是否被选中
  const isDataPermissionNodeChecked = (orgType: string, nodeId: string) => {
    const checkedNodes = state.organizationDefaultCheckedKeysMap.get(orgType)
    return checkedNodes ? checkedNodes.includes(nodeId) : false
  }

  // 处理数据权限的组织节点
  const processOrganizationNodes = () => {
    if (!state.detailData.dataPermissionRule?.organizationNodeMap) {
      return
    }

    const organizationNodeMap = state.detailData.dataPermissionRule.organizationNodeMap as unknown as Record<string, DataPermissionRuleOrganizationNodeDto>
    state.organizationDefaultCheckedKeysMap = new Map()

    Object.entries(organizationNodeMap).forEach(([orgType, nodeDto]) => {
      //父子联动模式
      state.organizationCascadeSelectionMap[orgType] = nodeDto.selectType === 'SELF_AND_SUB'

      if (nodeDto.organizationIdSet?.length) {
        //设置选中节点
        const treeData = state.organizationTreeOptionsMap.get(orgType)
        if (!treeData || treeData.length === 0) return
        if (nodeDto.selectType === 'SELF_AND_SUB') {
          const allChildrenIds = TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, nodeDto.organizationIdSet)
          state.organizationDefaultCheckedKeysMap.set(orgType, allChildrenIds)
        } else {
          state.organizationDefaultCheckedKeysMap.set(orgType, nodeDto.organizationIdSet)
        }

        //设置展开的节点
        const rootNodeIds = treeData.map(root => root.id)
        const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, nodeDto.organizationIdSet)
        const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !nodeDto.organizationIdSet.includes(node.id)).map(node => node.id)
        state.organizationDefaultExpandedKeysMap.set(orgType, expandedKeys)
      }
    })
  }

  const handleDrawerOpen = (node: BIamPermissionTreeExpandResponseVo) => {
    if (state.computeSelectedPermissionKeys.includes(node.id)) {
      state.currentMenuPermissionNode = node
      state.drawer = true
    } else {
      ElMessage.warning('请点击有已选标记的按钮')
    }
  }

  const loadPermissionTree = async () => {
    try {
      // 获取完整的权限树
      const permissionTreeData = await BIamPermissionApi.treeExpand({ id: 'machine' })
      state.permissionTreeOptions = permissionTreeData.children || []

      // 展开前两层节点
      const expandedKeys: string[] = []
      state.permissionTreeOptions.forEach(item => {
        expandedKeys.push(item.id)
        if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
            expandedKeys.push(child.id)
          })
        }
      })
      state.defaultPermissionExpandedKeys = expandedKeys

      // 设置选中的权限节点
      if (state.detailData.permissionIdSet?.length > 0) {
        state.defaultPermissionCheckedKeys = TreeDataUtil.getBottomLevelIds(state.permissionTreeOptions, state.detailData.permissionIdSet)
      }
    } catch (error) {
      console.error('加载权限树失败', error)
    } finally {
      state.permissionDataReady = true
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      state.ruleDataReady = false
      state.permissionDataReady = false

      await loadDataPermissionScopeTypes()
      await loadOrganizationTypeOptions()
      await enumStore.getEnumDataAsync(DICT_IAM_PERMISSION_RESOURCE_TYPE)

      //初始化组织树树数据
      await Promise.all(
        organizationTypeOptions.value.map(async option => {
          const organizationTreeRes = await BIamOrganizationApi.treeSimple({ type: option.code })
          state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
        })
      )

      //查询角色详情
      const detailRes = await BIamRoleApi.detail({ id: props.roleId })
      state.detailData = {
        ...detailRes,
        code: detailRes.code || '',
        userNumber: (detailRes as { userNumber?: number }).userNumber ?? 0,
        dataPermissionRule: detailRes.dataPermissionRule || {
          functionCode: 'DEFAULT',
          scopeCode: 'ORG_AND_SUB',
          organizationNodeMap: {}
        },
        permissionIdSet: detailRes.permissionIdSet || [],
        dataPermissionRuleMap: detailRes.dataPermissionRuleMap
          ? new Map(Object.entries(detailRes.dataPermissionRuleMap))
          : new Map<string, DataPermissionRuleDto[]>()
      } as unknown as typeof state.detailData

      //数据权限
      {
        if (state.detailData.dataPermissionRule?.scopeCode === 'CUSTOM') {
          // 初始化父子联动状态
          organizationTypeOptions.value.forEach(option => {
            state.organizationCascadeSelectionMap[option.code] = true
          })

          // 初始化组织展开节点
          for (const option of organizationTypeOptions.value) {
            const treeData = state.organizationTreeOptionsMap.get(option.code)
            state.organizationDefaultExpandedKeysMap.set(option.code, treeData?.map(root => root.id) ?? [])
          }

          // 处理已选中的组织节点
          processOrganizationNodes()
        }
      }

      //功能权限
      {
        await loadPermissionTree()

        //处理角色权限算出来的选中节点
        if (detailRes.permissionIdSet?.length > 0) {
          const checkedNodeIds: string[] = detailRes.permissionIdSet
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
    } catch (error) {
      console.error('获取角色详情失败', error)
    } finally {
      state.ruleDataReady = true
      state.loading = false
    }
  }

  /**
   * 处理对话框关闭事件
   */
  const handleDialogClosed = () => {
    state.loading = false
    state.ruleDataReady = false
    state.permissionDataReady = false
    state.drawer = false

    state.detailData = {
      id: '',
      type: '',
      name: '',
      code: '',
      status: '',
      defaultRole: false,
      userNumber: 0,
      description: '',
      createTime: 0,
      updateTime: 0,
      createName: '',
      updateName: '',
      dataPermissionRule: {
        functionCode: 'DEFAULT',
        scopeCode: 'ORG_AND_SUB',
        organizationNodeMap: {}
      },
      permissionIdSet: [],
      dataPermissionRuleMap: new Map()
    }

    state.organizationQueryMap = {}
    state.organizationCascadeSelectionMap = {}
    state.organizationDefaultCheckedKeysMap = new Map()
    state.organizationDefaultExpandedKeysMap = new Map()

    state.permissionTreeOptions = []
    state.defaultPermissionCheckedKeys = []
    state.defaultPermissionExpandedKeys = []
    state.computeSelectedPermissionKeys = []
    state.currentMenuPermissionNode = null
  }

  // 监听props变化
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

<style lang="scss" scoped>
  .el-tabs-card {
    min-height: 800px;

    .el-main-tab-pane {
      height: 100%;
    }

    .data-permission-tabs {
      height: 100%;
    }

    .el-row {
      width: 100%;
    }
  }

  .data-permission-detail {
    padding: 15px;
    border-radius: 4px;

    .tab-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .search-input {
        width: 50%;
      }
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    .checked-badge {
      margin-left: 10px;
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
    }
  }
</style>
