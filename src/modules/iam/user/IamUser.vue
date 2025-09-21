<template>
  <div class="user-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card class="box-card-tree-select">
          <template #header>
            <el-select v-model="state.searchForm.organizationType">
              <el-option v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
          <el-input v-model="state.organizationQuery" placeholder="请输入关键字" @input="onOrganizationQueryChanged" />
          <el-tree-v2
            ref="organizationTreeRef"
            :data="currentOrganizationTreeOptions"
            :props="state.organizationProps"
            :filter-method="organizationFilterMethod"
            @check="handleOrganizationCheck"
            show-checkbox
            :height="760"
          />
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <!-- 搜索卡片 -->
        <transition name="slide-fade">
          <el-card class="box-card-form" v-show="state.showSearchCard">
            <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
              <div class="form-items-group">
                <el-form-item label="角色:" prop="roleIdSet" class="form-item-responsive role-selector">
                  <el-select
                    v-model="selectedRoleIds"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择角色"
                    @remove-tag="removeQueryRole"
                    @clear="clearSelectorAllRoles"
                  >
                    <el-option v-for="role in state.selectedRoles" :key="role.id" :label="role.name" :value="role.id" />
                    <template #prefix>
                      <el-button size="small" type="primary" plain @click.stop="showRoleSelectorDialog" style="margin-right: 8px; height: 24px">选择</el-button>
                    </template>
                  </el-select>
                </el-form-item>

                <el-form-item label="门店:" prop="shopIdSet" class="form-item-responsive shop-selector">
                  <el-select
                    v-model="selectedShopIds"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择门店"
                    @remove-tag="removeQueryShop"
                    @clear="clearSelectorAllShops"
                  >
                    <el-option v-for="shop in state.selectedShops" :key="shop.id" :label="shop.name" :value="shop.id" />
                    <template #prefix>
                      <el-button size="small" type="primary" plain @click.stop="showShopSelectorDialog" style="margin-right: 8px; height: 24px">选择</el-button>
                    </template>
                  </el-select>
                </el-form-item>

                <el-form-item label="用户名:" prop="username" class="form-item-responsive">
                  <el-input v-model="state.searchForm.username" placeholder="请输入用户名" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="姓名:" prop="name" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="请输入姓名" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="编码:" prop="code" class="form-item-responsive">
                  <el-input v-model="state.searchForm.code" placeholder="请输入编码" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="手机号:" prop="phone" class="form-item-responsive">
                  <el-input v-model="state.searchForm.phone" placeholder="请输入手机号" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="状态:" prop="status" class="form-item-responsive">
                  <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                    <el-option v-for="option in state.userStatus" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>

                <el-form-item label="性别:" prop="gender" class="form-item-responsive">
                  <el-select v-model="state.searchForm.gender" placeholder="选择性别" clearable>
                    <el-option v-for="option in state.userGenders" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>

                <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive">
                  <el-date-picker
                    v-model="state.searchForm.createTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="x"
                    @change="handleTimeChange('create')"
                  />
                </el-form-item>

                <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive">
                  <el-date-picker
                    v-model="state.searchForm.updateTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="x"
                    @change="handleTimeChange('update')"
                  />
                </el-form-item>
              </div>

              <!-- 操作按钮组 -->
              <div class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:AUTH:USER:PAGE_EXPAND']">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSearch" v-hasPermission="['SYSTEM:AUTH:USER:PAGE_EXPAND']">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>
        </transition>

        <!-- 数据卡片 -->
        <el-card class="box-card-data">
          <div class="operation-buttons">
            <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['SYSTEM:AUTH:USER:CREATE']">添加</el-button>
            <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
          </div>

          <el-table :data="state.tableData" border style="margin: 10px 0" v-loading="state.loading" :height="state.dataCardHeight" stripe highlight-current-row>
            <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
            <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
            <el-table-column prop="username" label="用户名" align="center" width="160" fixed></el-table-column>
            <el-table-column prop="name" label="姓名" align="center" width="120"></el-table-column>
            <el-table-column prop="code" label="编码" align="center" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" align="center" width="120">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'ENABLE'"
                  :inactive-value="'DISABLE'"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  @change="toggleStatus(row)"
                  v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_STATUS']"
                />
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" align="center" width="120"></el-table-column>
            <el-table-column prop="gender" label="性别" align="center" width="80">
              <template #default="{ row }">
                {{ getUserGenderLabel(row.gender) }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="180">
              <template #default="{ row }">
                {{ formatTimestamp(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="updateName" label="修改人" align="center" width="160"></el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
              <template #default="{ row }">
                {{ formatTimestamp(row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="230" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="showDetailDialog(row)">详情</el-button>
                <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE']">编辑</el-button>
                <el-button size="small" type="warning" @click="showPhoneDialog(row)" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_PHONE']">修改手机号</el-button>
                <el-button size="small" type="warning" @click="showPermissionDialog(row)" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_PERMISSION']">
                  修改权限
                </el-button>
                <el-button size="small" type="danger" @click="showPasswordDialog(row)" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_PASSWORD']">
                  修改密码
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :page-sizes="[20, 50, 100, 200, 500, 1000]"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            v-hasPermission="['SYSTEM:AUTH:USER:PAGE_EXPAND']"
          />
        </el-card>

        <!-- 对话框组件 -->
        <IamUserAddDialog v-model="state.dialog.add" @success="handleAddSuccess" />
        <IamUserDetailDialog v-model="state.dialog.detail" :userId="state.currentUserId" />
        <IamUserEditDialog v-model="state.dialog.edit" :userId="state.currentUserId" @success="handleEditSuccess" />
        <IamUserEditPhoneDialog
          v-model="state.dialog.phone"
          :userId="state.currentUserId"
          :current-phone="state.currentUserPhone"
          @success="handlePhoneUpdateSuccess"
        />
        <IamUserEditPasswordDialog v-model="state.dialog.password" :userId="state.currentUserId" />
        <IamUserEditPermissionDialog v-model="state.dialog.permission" :userId="state.currentUserId" @success="handlePermissionUpdateSuccess" />
        <IamRoleQuickSelectDialog v-model="state.roleDialogVisible" @confirm="handleQueryRoleSelect" :multiple="true" :selected-roles="state.selectedRoles" />
        <DataShopQuickSelectDialog v-model="state.shopDialogVisible" @confirm="handleQueryShopSelect" :multiple="true" :selected-shops="state.selectedShops" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  import { ElTreeV2 } from 'element-plus'
  import { onMounted, reactive, computed, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { IamUserApi } from '@/modules/iam/user/api/IamUser.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type {
    IamUserDetailResponseVo,
    IamUserExpandPageResponse,
    IamUserQueryPageRequestVo,
    IamUserUpdateStatusRequestVo
  } from '@/modules/iam/user/type/IamUser.type'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'
  import type { IamRoleSimpleListResponseVo } from '@/modules/iam/role/type/IamRole.type'
  import type { DataShopSimpleListResponseVo } from '@/modules/data/shop/type/DataShop.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import IamUserAddDialog from '@/modules/iam/user/IamUserAddDialog.vue'
  import IamUserDetailDialog from '@/modules/iam/user/IamUserDetailDialog.vue'
  import IamUserEditDialog from '@/modules/iam/user/IamUserEditDialog.vue'
  import IamUserEditPhoneDialog from '@/modules/iam/user/IamUserEditPhoneDialog.vue'
  import IamUserEditPasswordDialog from '@/modules/iam/user/IamUserEditPasswordDialog.vue'
  import IamUserEditPermissionDialog from '@/modules/iam/user/IamUserEditPermissionDialog.vue'
  import IamRoleQuickSelectDialog from '@/modules/iam/role/IamRoleQuickSelectDialog.vue'
  import DataShopQuickSelectDialog from '@/modules/data/shop/DataShopQuickSelectDialog.vue'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    roleDialogVisible: false,
    shopDialogVisible: false,
    dataCardHeight: 'calc(100vh - 500px)',

    //枚举状态
    userStatus: [],
    userGenders: [],
    organizationTypeOptions: [],

    //搜索条件
    selectedRoles: [] as IamRoleSimpleListResponseVo[],
    selectedShops: [] as DataShopSimpleListResponseVo[],

    // 组织树相关状态
    organizationQuery: '',
    organizationTreeOptions: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),
    currentUserId: '',
    currentUserPhone: '',
    tableData: [] as IamUserDetailResponseVo[],

    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      username: '',
      name: '',
      code: '',
      phone: '',
      status: null,
      gender: null,
      organizationType: null as string | null,
      organizationIdSet: [] as string[],
      createTimeRange: [] as number[],
      updateTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },
    // 对话框状态
    dialog: {
      add: false,
      detail: false,
      edit: false,
      phone: false,
      password: false,
      permission: false
    },
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  const organizationTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  // 计算当前组织的状态
  const currentOrganizationTreeOptions = ref<IamOrganizationSimpleTreeResponseVo[]>([])

  const onOrganizationQueryChanged = () => {
    if (organizationTreeRef.value) {
      organizationTreeRef.value.filter(state.organizationQuery.trim())
    }

    if (state.organizationQuery.trim() === '') {
      organizationTreeRef.value?.setExpandedKeys([])
    }
  }

  const organizationFilterMethod = (query: string, node: IamOrganizationSimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  // 处理组织树勾选事件
  const handleOrganizationCheck = () => {
    if (organizationTreeRef.value) {
      state.searchForm.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(
        currentOrganizationTreeOptions.value,
        organizationTreeRef.value.getCheckedKeys()
      ).map(node => node.id)
    }
  }

  // 构建查询参数
  const buildQueryParams = (): IamUserQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.username && { username: searchForm.username }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.phone && { phone: searchForm.phone }),
      ...(searchForm.gender && { gender: searchForm.gender }),
      ...(state.selectedRoles.length > 0 && { roleIdSet: state.selectedRoles.map(r => r.id) }),
      ...(state.selectedShops.length > 0 && { shopIdSet: state.selectedShops.map(s => s.id) }),
      ...(searchForm.organizationType && { organizationType: searchForm.organizationType }),
      ...(searchForm.organizationIdSet.length > 0 && { organizationIdSet: searchForm.organizationIdSet }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
  }

  // 获取用户列表
  const fetchData = async () => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const res: IamUserExpandPageResponse = await IamUserApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取用户列表失败', error)
    } finally {
      state.loading = false
    }
  }

  const showRoleSelectorDialog = () => {
    state.roleDialogVisible = true
  }

  const showShopSelectorDialog = () => {
    state.shopDialogVisible = true
  }

  // 计算属性
  const selectedRoleIds = computed({
    get: () => state.selectedRoles.map(r => r.id),
    set: newIds => {
      state.selectedRoles = newIds.map(id => state.selectedRoles.find(role => role.id === id) || { id })
    }
  })

  const selectedShopIds = computed({
    get: () => state.selectedShops.map(shop => shop.id),
    set: newIds => {
      state.selectedShops = newIds.map(id => state.selectedShops.find(shop => shop.id === id) || { id, name: '' })
    }
  })

  const clearSelectorAllRoles = () => {
    state.selectedRoles = []
  }

  const removeQueryRole = (roleId: string) => {
    state.selectedRoles = state.selectedRoles.filter(role => role.id !== roleId)
  }

  const clearSelectorAllShops = () => {
    state.selectedShops = []
  }

  const removeQueryShop = (shopId: string) => {
    state.selectedShops = state.selectedShops.filter(shop => shop.id !== shopId)
  }

  const handleQueryRoleSelect = (roles: IamRoleSimpleListResponseVo[]) => {
    state.selectedRoles = roles
    state.roleDialogVisible = false
  }

  const handleQueryShopSelect = (shops: DataShopSimpleListResponseVo[]) => {
    state.selectedShops = shops
    state.shopDialogVisible = false
  }

  // 处理时间范围变更
  const handleTimeChange = (type: 'create' | 'update') => {
    const range = type === 'create' ? state.searchForm.createTimeRange : state.searchForm.updateTimeRange
    if (range && range.length === 2) {
      state.searchForm[`${type}StartTime`] = range[0]
      state.searchForm[`${type}EndTime`] = range[1]
    } else {
      state.searchForm[`${type}StartTime`] = undefined
      state.searchForm[`${type}EndTime`] = undefined
    }
  }

  // 搜索
  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  // 重置搜索
  const resetSearch = () => {
    state.searchForm = {
      username: '',
      name: '',
      code: '',
      phone: '',
      status: null,
      gender: null,
      organizationType: state.searchForm.organizationType,
      organizationIdSet: [],
      createTimeRange: [],
      updateTimeRange: [],
      createStartTime: undefined,
      createEndTime: undefined,
      updateStartTime: undefined,
      updateEndTime: undefined
    }
    state.selectedRoles = []

    state.organizationQuery = ''
    organizationTreeRef.value?.setCheckedKeys([])

    handleSearch()
  }

  // 分页改变
  const handlePageChange = () => fetchData()

  // 分页大小改变
  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  // 显示添加用户对话框
  const showAddDialog = () => {
    state.currentUserId = ''
    state.dialog.add = true
  }

  // 显示编辑用户对话框
  const showEditDialog = (row: IamUserDetailResponseVo) => {
    state.currentUserId = row.id
    state.dialog.edit = true
  }

  // 显示用户详情对话框
  const showDetailDialog = (row: IamUserDetailResponseVo) => {
    state.currentUserId = row.id
    state.dialog.detail = true
  }

  // 显示修改手机号对话框
  const showPhoneDialog = (row: IamUserDetailResponseVo) => {
    state.currentUserId = row.id
    state.currentUserPhone = row.phone
    state.dialog.phone = true
  }

  // 显示修改权限对话框
  const showPermissionDialog = (row: IamUserDetailResponseVo) => {
    state.currentUserId = row.id
    state.dialog.permission = true
  }

  // 显示修改密码对话框
  const showPasswordDialog = (row: IamUserDetailResponseVo) => {
    state.currentUserId = row.id
    state.dialog.password = true
  }

  // 切换用户状态
  const toggleStatus = async (row: IamUserDetailResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '禁用' : '启用'}用户 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const params: IamUserUpdateStatusRequestVo = {
        id: row.id,
        status: row.status
      }

      await IamUserApi.updateStatus(params)
      ElMessage.success('操作成功')
    } catch (error) {
      console.error('修改用户状态失败', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  // 处理操作成功
  const handleAddSuccess = () => fetchData()
  const handleEditSuccess = () => fetchData()
  const handlePhoneUpdateSuccess = () => fetchData()
  const handlePermissionUpdateSuccess = () => fetchData()

  const getUserGenderLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('CrmGenderEnum', type)
    return enumItem?.message || type
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  watch(
    () => state.searchForm.organizationType,
    async organizationType => {
      if (!state.organizationTreeOptions.has(organizationType)) {
        const response = await IamOrganizationApi.treeSimple({ type: organizationType })
        state.organizationTreeOptions.set(organizationType, response.children)
      }

      state.searchForm.organizationIdSet = []
      organizationTreeRef.value?.setCheckedKeys([])
      currentOrganizationTreeOptions.value = state.organizationTreeOptions.get(organizationType)!
    },
    { immediate: false }
  )

  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.dataCardHeight = newVal ? 'calc(100vh - 500px)' : 'calc(100vh - 200px)'
      }, 80)
    },
    { immediate: false }
  )

  // 初始化
  onMounted(async () => {
    // 枚举选项
    const [userStatus, userGenders, organizationTypeOptions] = await Promise.all([
      enumStore.getEnumDataAsync('StatusEnum'),
      enumStore.getEnumDataAsync('CrmGenderEnum'),
      enumStore.getEnumDataAsync('IamOrganizationTypeEnum')
    ])
    state.userStatus = userStatus
    state.userGenders = userGenders
    state.organizationTypeOptions = organizationTypeOptions

    state.searchForm.organizationType = organizationTypeOptions[0].code

    await fetchData()
  })
</script>

<style scoped lang="scss">
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.6s ease;
    overflow: hidden;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
    height: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .user-page-div {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: flex-start;

    .box-card-tree-select {
      margin: 4px;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      .el-select {
        margin: 0 0 0 0;
        width: 100%;
      }
    }
  }

  .box-card-form {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    .search-form {
      display: flex;
      flex-direction: column;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: flex-start;

        .form-item-responsive {
          margin-bottom: 8px;
          flex: 1 1 320px;
          min-width: 120px;
          max-width: 320px;

          &.role-selector {
            min-width: 320px;
          }

          &.shop-selector {
            min-width: 320px;
          }
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;
      }
    }
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .form-item-responsive {
      flex-basis: 30% !important;
    }
  }

  @media (max-width: 768px) {
    .form-item-responsive {
      flex-basis: 45% !important;
    }

    .button-group {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .box-card-data {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-switch {
        margin-left: 8px;
      }
    }
  }
</style>
