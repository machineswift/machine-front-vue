<template>
  <el-dialog
    v-model="state.visible"
    title="用户详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="40%"
    top="5vh"
  >
    <el-tabs type="border-card" v-loading="state.loading" class="el-tabs-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" class="el-main-tab-pane">
        <el-form :model="state.detailData" label-width="100px">
          <el-divider content-position="left">基本信息</el-divider>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input :model-value="state.detailData.username || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input :model-value="state.detailData.name || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="编码">
                <el-input :model-value="state.detailData.code || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input :model-value="state.detailData.phone || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
                  {{ state.detailData.status ? enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) : '无' }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-input :model-value="state.detailData.gender ? enumStore.getEnumLabel(DICT_GENDER, state.detailData.gender) : '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

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

      <!-- 组织关系标签页 -->
      <el-tab-pane label="组织关系" v-if="state.organizationDataReady" class="el-main-tab-pane">
        <el-tabs type="border-card" class="custom-organization-tabs">
          <el-tab-pane v-for="option in organizationTypeOptions" :key="option.code" :label="option.message">
            <div class="tab-header">
              <el-input v-model="state.organizationQueryMap[option.code]" placeholder="请输入关键字" clearable class="search-input" :disabled="true" />
            </div>
            <el-tree-v2
              :data="state.organizationTreeOptionsMap.get(option.code)"
              :props="state.organizationProps"
              :height="400"
              show-checkbox
              node-key="id"
              :default-expanded-keys="state.organizationDefaultExpandedKeysMap.get(option.code) || []"
              :default-checked-keys="state.organizationDefaultCheckedKeysMap.get(option.code) || []"
              :disabled="true"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span>{{ node.label }}</span>
                  <span v-if="isOrganizationNodeChecked(option.code, data.id)" class="checked-badge">
                    <el-tag size="small" type="success">已选</el-tag>
                  </span>
                </span>
              </template>
            </el-tree-v2>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 角色关系标签页 -->
      <el-tab-pane label="角色关系" v-if="state.roleDataReady" class="el-main-tab-pane">
        <el-tabs type="border-card" class="custom-role-tabs">
          <el-tab-pane v-for="option in roleTypeOptions" :key="option.code" :label="option.message">
            <el-table :data="getFilteredRoleList(option.code)" border style="width: 100%" height="400">
              <el-table-column prop="name" label="角色名称" width="180" align="center" fixed="left" />
              <el-table-column prop="code" label="角色编码" width="180" align="center" />
              <el-table-column prop="type" label="角色类型" width="120" align="center">
                <template #default="{ row }">
                  {{ enumStore.getEnumLabel(DICT_IAM_ROLE_TYPE, row.type) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'ENABLE' ? 'success' : 'danger'">
                    {{ row.status === 'ENABLE' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" width="100" align="center">
                <template #default="{ row }">
                  {{ row.sort || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="关联门店" v-if="option.code === 'SHOP'" align="center" width="280" fixed="right">
                <template #default="{ row }">
                  <el-select v-model="row.shopIdList" multiple clearable collapse-tags collapse-tags-tooltip placeholder="选择门店">
                    <el-option v-for="shop in row.shopList" :key="shop.id" :label="shop.name" :value="shop.id" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { BIamUserApi } from '@/modules/biam/user/api/BIamUser.api'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS, DICT_GENDER, DICT_IAM_ROLE_TYPE, DICT_IAM_ORG_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamUserDetailResponseVo, BIamUserRoleInfoResponse } from '@/modules/biam/user/type/BIamUser.type'
  import type { BIamOrganizationSimpleTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'
  import { ElMessage } from 'element-plus'

  const enumStore = useDictionaryEnumStore()

  const { options: roleTypeOptions, load: loadRoleTypeOptions } = useEnumOptions(DICT_IAM_ROLE_TYPE)
  const { options: organizationTypeOptions, load: loadOrganizationTypeOptions } = useEnumOptions(DICT_IAM_ORG_TYPE)

  const props = defineProps<{
    modelValue: boolean
    userId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    organizationDataReady: false,
    roleDataReady: false,

    // 组织树相关
    organizationQueryMap: {} as Record<string, string>,
    organizationTreeOptionsMap: new Map<string, BIamOrganizationSimpleTreeResponseVo[]>(),
    organizationDefaultCheckedKeysMap: new Map<string, string[]>(),
    organizationDefaultExpandedKeysMap: new Map<string, string[]>(),

    // 角色相关
    userRoleInfoList: [] as BIamUserRoleInfoResponse[],

    // 详情数据
    detailData: {} as Partial<BIamUserDetailResponseVo>,

    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  // 格式化时间戳
  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 检查组织节点是否被选中
  const isOrganizationNodeChecked = (orgType: string, nodeId: string) => {
    const checkedNodes = state.organizationDefaultCheckedKeysMap.get(orgType)
    return checkedNodes ? checkedNodes.includes(nodeId) : false
  }

  const getFilteredRoleList = (roleType: string) => {
    return state.userRoleInfoList.filter(role => role.type === roleType)
  }

  const loadOrganizationTree = async () => {
    try {
      // 初始化组织树数据
      await Promise.all(
        organizationTypeOptions.value.map(async option => {
          const organizationTreeRes = await BIamOrganizationApi.treeSimple({ type: option.code })
          state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
        })
      )

      // 设置默认展开的节点
      organizationTypeOptions.value.forEach(option => {
        const treeData = state.organizationTreeOptionsMap.get(option.code)
        state.organizationDefaultExpandedKeysMap.set(option.code, treeData?.map(root => root.id) ?? [])
      })

      // 处理用户关联的组织
      if (state.detailData.organizationIdMap) {
        const organizationIdMap = new Map(Object.entries(state.detailData.organizationIdMap))

        organizationIdMap.forEach((organizationIds, orgType) => {
          if (organizationIds?.length > 0) {
            const treeData = state.organizationTreeOptionsMap.get(orgType)
            if (treeData) {
              // 设置选中节点
              const checkedKeys = TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, organizationIds)
              state.organizationDefaultCheckedKeysMap.set(orgType, checkedKeys)

              // 设置展开的节点
              const rootNodeIds = treeData.map(root => root.id)
              const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, organizationIds)
              const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !organizationIds.includes(node.id)).map(node => node.id)
              state.organizationDefaultExpandedKeysMap.set(orgType, expandedKeys)
            }
          }
        })
      }
    } catch (error) {
      console.error('加载组织树失败', error)
      ElMessage.error('加载组织树失败')
    }
  }

  // 处理用户角色数据
  const processUserRoles = () => {
    if (state.detailData.userRoleInfoList) {
      state.userRoleInfoList = state.detailData.userRoleInfoList.map(role => ({
        ...role,
        shopIdList: role.shopList?.map(shop => shop.id) || []
      }))
    }
  }

  const fetchData = async () => {
    if (!props.userId) return

    try {
      state.loading = true
      state.organizationDataReady = false
      state.roleDataReady = false

      // 获取枚举数据
      await loadOrganizationTypeOptions()
      await loadRoleTypeOptions()

      // 查询用户详情
      const res = await BIamUserApi.detail({ id: props.userId })
      state.detailData = res || {}

      // 加载组织树数据
      await loadOrganizationTree()
      state.organizationDataReady = true

      // 处理角色数据
      processUserRoles()
      state.roleDataReady = true
    } catch (error) {
      console.error('获取用户详情失败', error)
      ElMessage.error('获取用户详情失败')
    } finally {
      state.loading = false
    }
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.userRoleInfoList = []
    state.loading = false
    state.organizationDataReady = false
    state.roleDataReady = false

    state.organizationQueryMap = {}
    state.organizationTreeOptionsMap = new Map()
    state.organizationDefaultCheckedKeysMap = new Map()
    state.organizationDefaultExpandedKeysMap = new Map()
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.userId],
    async ([modelValue, userId]) => {
      if (modelValue && userId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .el-tabs-card {
    min-height: 600px;

    .el-main-tab-pane {
      height: 100%;
    }

    .custom-organization-tabs,
    .custom-role-tabs {
      height: 100%;
    }

    .el-row {
      width: 100%;
    }
  }

  .tab-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .search-input {
      width: 50%;
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

  .el-table {
    margin: 10px;
  }
</style>
