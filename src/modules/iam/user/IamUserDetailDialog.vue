<template>
  <el-dialog
    v-model="state.visible"
    title="用户详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-tabs type="border-card" v-loading="state.loading" class="el-tabs-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" class="el-main-tab-pane">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">
            {{ state.detailData.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ state.detailData.username || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="姓名">
            {{ state.detailData.name || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="编码">
            {{ state.detailData.code || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
              {{ getUserStatusLabel(state.detailData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ state.detailData.phone || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ getUserGenderLabel(state.detailData.gender) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ state.detailData.createName || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人">
            {{ state.detailData.updateName || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTimestamp(state.detailData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTimestamp(state.detailData.updateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ state.detailData.description || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 组织关系标签页 -->
      <el-tab-pane label="组织关系" v-if="state.organizationDataReady" class="el-main-tab-pane">
        <el-tabs type="border-card" class="custom-organization-tabs">
          <el-tab-pane v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message">
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
          <el-tab-pane v-for="option in state.roleTypeOptions" :key="option.code" :label="option.message">
            <el-table :data="getFilteredRoleList(option.code)" border style="width: 100%" height="400">
              <el-table-column prop="name" label="角色名称" width="180" align="center" fixed="left" />
              <el-table-column prop="code" label="角色编码" width="180" align="center" />
              <el-table-column prop="type" label="角色类型" width="120" align="center">
                <template #default="{ row }">
                  {{ getRoleTypeLabel(row.type) }}
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
  import { IamUserApi } from '@/modules/iam/user/api/IamUser.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'
  import type { IamUserDetailResponseVo, IamUserRoleInfoResponse } from '@/modules/iam/user/type/IamUser.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import { ElMessage } from 'element-plus'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    userId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    organizationDataReady: false,
    roleDataReady: false,

    // 枚举状态
    roleTypeOptions: [] as Array<{ code: string; message: string }>,
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,

    // 组织树相关
    organizationQueryMap: {} as Record<string, string>,
    organizationTreeOptionsMap: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),
    organizationDefaultCheckedKeysMap: new Map<string, string[]>(),
    organizationDefaultExpandedKeysMap: new Map<string, string[]>(),

    // 角色相关
    userRoleInfoList: [] as IamUserRoleInfoResponse[],

    // 详情数据
    detailData: {} as Partial<IamUserDetailResponseVo>,

    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  // 获取用户状态标签
  const getUserStatusLabel = (type?: string): string => {
    if (!type) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('StatusEnum', type)
    return enumItem?.message || type
  }

  // 获取用户性别标签
  const getUserGenderLabel = (type?: string): string => {
    if (!type) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('GenderEnum', type)
    return enumItem?.message || type
  }

  // 获取角色类型标签
  const getRoleTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('IamRoleTypeEnum', type)
    return enumItem?.message || type
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 检查组织节点是否被选中
  const isOrganizationNodeChecked = (orgType: string, nodeId: string) => {
    const checkedNodes = state.organizationDefaultCheckedKeysMap.get(orgType)
    return checkedNodes ? checkedNodes.includes(nodeId) : false
  }

  // 获取过滤后的角色列表
  const getFilteredRoleList = (roleType: string) => {
    return state.userRoleInfoList.filter(role => role.type === roleType)
  }

  // 加载组织树数据
  const loadOrganizationTree = async () => {
    try {
      // 初始化组织树数据
      await Promise.all(
        state.organizationTypeOptions.map(async option => {
          const organizationTreeRes = await IamOrganizationApi.treeSimple({ type: option.code })
          state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
        })
      )

      // 设置默认展开的节点
      state.organizationTypeOptions.forEach(option => {
        const treeData = state.organizationTreeOptionsMap.get(option.code)
        state.organizationDefaultExpandedKeysMap.set(
          option.code,
          treeData.map(root => root.id)
        )
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

  // 获取用户详情
  const fetchData = async () => {
    if (!props.userId) return

    try {
      state.loading = true
      state.organizationDataReady = false
      state.roleDataReady = false

      // 获取枚举数据
      const [organizationTypeOptions, roleTypeOptions] = await Promise.all([
        enumStore.getEnumDataAsync('IamOrganizationTypeEnum'),
        enumStore.getEnumDataAsync('IamRoleTypeEnum')
      ])
      state.organizationTypeOptions = organizationTypeOptions
      state.roleTypeOptions = roleTypeOptions

      // 查询用户详情
      const res = await IamUserApi.detail({ id: props.userId })
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

    // 重置组织树相关状态
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

  .el-descriptions {
    margin: 10px;

    :deep(.el-descriptions__cell) {
      padding: 12px 10px;
    }
  }

  .el-table {
    margin: 10px;
  }
</style>
