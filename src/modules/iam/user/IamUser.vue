<template>
  <div ref="pageContainerRef" class="user-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card ref="treeCardRef" class="box-card-tree-select">
          <template #header>
            <el-select v-model="state.searchForm.organizationType">
              <el-option v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
          <div ref="treeBodyRef" class="tree-body">
            <el-input ref="treeSearchInputRef" v-model="state.organizationQuery" placeholder="请输入关键字" @input="onOrganizationQueryChanged" />
            <!-- 树组件高度动态计算，初始不显示 -->
            <div v-show="treeHeightReady" style="flex: 1; min-height: 0">
              <el-tree-v2
                ref="organizationTreeRef"
                :data="currentOrganizationTreeOptions"
                :props="state.organizationProps"
                :filter-method="organizationFilterMethod"
                @check="handleOrganizationCheck"
                show-checkbox
                :height="organizationTreeHeight"
              />
            </div>
            <div v-show="!treeHeightReady" class="tree-placeholder">
              <el-skeleton :rows="6" animated />
            </div>
          </div>
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div ref="rightContentRef" class="user-main-content">
          <!-- 搜索卡片 -->
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
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
                        <el-button size="small" type="primary" plain @click.stop="showRoleSelectorDialog" style="margin-right: 8px; height: 24px">
                          选择
                        </el-button>
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
                        <el-button size="small" type="primary" plain @click.stop="showShopSelectorDialog" style="margin-right: 8px; height: 24px">
                          选择
                        </el-button>
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

                  <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive form-item-date-picker">
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

                  <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive form-item-date-picker">
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
          <el-card ref="dataCardRef" class="box-card-data">
            <div ref="operationButtonsRef" class="operation-buttons">
              <div class="operation-buttons-left">
                <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['SYSTEM:AUTH:USER:CREATE']">添加</el-button>
                <el-dropdown trigger="click" @command="handleExportCommand" v-hasPermission="['SYSTEM:AUTH:USER:EXPORT']">
                  <el-button type="primary" size="default">
                    导出
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="currentList">当前列表</el-dropdown-item>
                      <el-dropdown-item command="currentSelected" :disabled="selectedRowCount === 0">当前选中</el-dropdown-item>
                      <el-dropdown-item command="currentCondition" divided>当前条件</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
            </div>

            <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
            <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
              <el-table
                ref="tableRef"
                :data="state.tableData"
                border
                v-loading="state.loading"
                :height="tableHeight"
                stripe
                highlight-current-row
                row-key="id"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" align="center" :reserve-selection="true" fixed />
                <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
                <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
                <el-table-column prop="username" label="用户名" align="center" width="160" fixed></el-table-column>
                <el-table-column prop="name" label="姓名" align="center" width="120"></el-table-column>
                <el-table-column prop="code" label="编码" align="center" width="180"></el-table-column>
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
                <el-table-column prop="gender" label="性别" align="center" width="120">
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
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button size="small" @click="showDetailDialog(row)">详情</el-button>
                      <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE']">编辑</el-button>
                      <el-dropdown trigger="click" @command="command => handleUserDropdownCommand(command, row)" placement="bottom-end">
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="updatePhone" :disabled="!hasPermission(['SYSTEM:AUTH:USER:UPDATE_PHONE'])">
                              <el-icon><Phone /></el-icon>
                              <span>修改手机号</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updatePermission" :disabled="!hasPermission(['SYSTEM:AUTH:USER:UPDATE_PERMISSION'])">
                              <el-icon><Key /></el-icon>
                              <span>修改权限</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updatePassword" divided :disabled="!hasPermission(['SYSTEM:AUTH:USER:UPDATE_PASSWORD'])">
                              <el-icon><Lock /></el-icon>
                              <span>修改密码</span>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <el-pagination
                ref="paginationRef"
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
            </div>

            <!-- 骨架屏占位 -->
            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>
        </div>

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
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:AUTH:USER'
  })
  import { ElTreeV2 } from 'element-plus'
  import { onMounted, reactive, computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search, ArrowDown, Phone, Key, Lock } from '@element-plus/icons-vue'
  import { hasPermission } from '@/common/utils/Permission.util'
  import { IamUserApi } from '@/modules/iam/user/api/IamUser.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import type {
    IamUserDetailResponseVo,
    IamUserExpandPageResponse,
    IamUserExportRequestVo,
    IamUserQueryPageRequestVo,
    IamUserUpdateStatusRequestVo
  } from '@/modules/iam/user/type/IamUser.type'
  import { TreeDataUtil } from '@/common/utils/TreeData.util'
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
  const router = useRouter()

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    roleDialogVisible: false,
    shopDialogVisible: false,

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
  const pageContainerRef = ref<HTMLElement | null>(null)
  const rightContentRef = ref<HTMLElement | null>(null)
  const treeCardRef = ref()
  const treeBodyRef = ref<HTMLElement | null>(null)
  const treeSearchInputRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)
  const tableRef = ref<InstanceType<typeof import('element-plus').ElTable>>()

  /** 跨页选中的用户 ID 集合，翻页后仍保留 */
  const selectedUserIdSet = ref<Set<string>>(new Set())
  /** 恢复勾选时忽略 selection-change */
  const isRestoringSelection = ref(false)
  /** 待恢复的选中 ID（翻页前保存），watch tableData 后再恢复，避免被 selection-change([]) 冲掉 */
  const pendingRestoreIds = ref<Set<string> | null>(null)

  // 表格/树高度 - 初始为0，等计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  const organizationTreeHeight = ref<number>(0)
  const treeHeightReady = ref<boolean>(false)

  let resizeObserver: ResizeObserver | null = null
  let isFirstTableCalculation = true
  let isFirstTreeCalculation = true

  const resolveElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const calculateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    const operationButtonsHeight = operationButtonsRef.value?.offsetHeight || 50
    const paginationHeight = paginationRef.value?.offsetHeight || 60
    const contentSpacing = 16
    const newHeight = Math.max(320, cardBody.clientHeight - operationButtonsHeight - paginationHeight - contentSpacing)

    if (tableHeight.value !== newHeight) {
      tableHeight.value = newHeight
    }

    // 首次计算完成后显示表格
    if (isFirstTableCalculation && tableHeight.value > 0) {
      tableHeightReady.value = true
      isFirstTableCalculation = false
    }
  }

  const calculateTreeHeight = async () => {
    await nextTick()
    const treeBodyEl = treeBodyRef.value
    if (!treeBodyEl) return
    const inputEl = resolveElement(treeSearchInputRef.value)
    const inputHeight = inputEl?.offsetHeight || 32
    const spacing = 10
    const newHeight = Math.max(260, treeBodyEl.clientHeight - inputHeight - spacing)

    if (organizationTreeHeight.value !== newHeight) {
      organizationTreeHeight.value = newHeight
    }

    // 首次计算完成后显示树组件
    if (isFirstTreeCalculation && organizationTreeHeight.value > 0) {
      treeHeightReady.value = true
      isFirstTreeCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const rightContentEl = rightContentRef.value
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    const treeCardEl = resolveElement(treeCardRef.value)
    if (!rightContentEl || !pageContainerEl || !searchCardEl || !dataCardEl || !treeCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
      calculateTreeHeight()
    })
    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(rightContentEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
    resizeObserver.observe(treeCardEl)
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

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

  /** 选择变化时：当前页外的已选 ID 保留，当前页以本次勾选为准，实现跨页多选 */
  const handleSelectionChange = (rows: IamUserDetailResponseVo[]) => {
    if (isRestoringSelection.value || pendingRestoreIds.value !== null) return
    const currentPageIds = new Set(state.tableData.map((r: IamUserDetailResponseVo) => r.id))
    const selectedIds = new Set(rows.map((r: IamUserDetailResponseVo) => r.id))
    const otherPageIds = [...selectedUserIdSet.value].filter((id: string) => !currentPageIds.has(id))
    selectedUserIdSet.value = new Set([...otherPageIds, ...selectedIds])
  }

  /** 根据 ID 集合恢复当前页勾选（在表格渲染完成后调用） */
  const doRestoreTableSelection = (idsToSelect: Set<string>) => {
    const table = tableRef.value
    if (!table || !state.tableData.length) return
    isRestoringSelection.value = true
    state.tableData.forEach((row: IamUserDetailResponseVo) => {
      table.toggleRowSelection(row, idsToSelect.has(row.id))
    })
    selectedUserIdSet.value = new Set(idsToSelect)
    nextTick(() => {
      isRestoringSelection.value = false
      pendingRestoreIds.value = null
    })
  }

  /** 构建导出请求参数（与查询条件字段一致，支持可选 userIdSet） */
  const buildExportRequest = (options: { userIdSet?: string[] }): IamUserExportRequestVo => {
    const { searchForm } = state
    const base: IamUserExportRequestVo = {
      ...(options.userIdSet && options.userIdSet.length > 0 && { userIdSet: options.userIdSet }),
      ...(searchForm.username && { username: searchForm.username }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.phone && { phone: searchForm.phone }),
      ...(searchForm.gender && { gender: searchForm.gender }),
      ...(state.selectedRoles.length > 0 && { roleIdSet: state.selectedRoles.map(r => r.id) }),
      ...(state.selectedShops.length > 0 && { shopIdSet: state.selectedShops.map(s => s.id) }),
      ...(searchForm.organizationType && { organizationType: searchForm.organizationType }),
      ...(searchForm.organizationIdSet && searchForm.organizationIdSet.length > 0 && { organizationIdSet: searchForm.organizationIdSet }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
    return base
  }

  /** 导出下拉选项：currentList 当前列表 | currentSelected 当前选中 | currentCondition 当前条件 */
  const handleExportCommand = async (command: 'currentList' | 'currentSelected' | 'currentCondition') => {
    let request: IamUserExportRequestVo
    if (command === 'currentList') {
      const ids = state.tableData.map((r: { id: string }) => r.id)
      request = buildExportRequest(ids.length > 0 ? { userIdSet: ids } : {})
    } else if (command === 'currentSelected') {
      const ids = Array.from(selectedUserIdSet.value)
      request = buildExportRequest(ids.length > 0 ? { userIdSet: ids } : {})
    } else {
      request = buildExportRequest({})
    }

    try {
      await IamUserApi.exportUser(request)
      await ElMessageBox.confirm('导出任务已创建，文件生成后可到下载中心查看并下载。', '导出成功', {
        confirmButtonText: '前往下载中心',
        cancelButtonText: '知道了',
        type: 'success'
      })
      router.push('/system/workspace/download')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导出失败', error)
      }
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
      pendingRestoreIds.value = new Set(selectedUserIdSet.value)
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
      state.selectedRoles = newIds.map(id => state.selectedRoles.find(role => role.id === id) || ({ id } as IamRoleSimpleListResponseVo))
    }
  })

  const selectedShopIds = computed({
    get: () => state.selectedShops.map(shop => shop.id),
    set: newIds => {
      state.selectedShops = newIds.map(id => state.selectedShops.find(shop => shop.id === id) || ({ id, name: '' } as DataShopSimpleListResponseVo))
    }
  })

  const selectedRowCount = computed(() => selectedUserIdSet.value.size)

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
    calculateTableHeight()
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
    selectedUserIdSet.value = new Set()
    tableRef.value?.clearSelection?.()

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

  /** 处理用户下拉菜单命令 */
  const handleUserDropdownCommand = (command: string, row: IamUserDetailResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updatePhone: () => showPhoneDialog(row),
      updatePermission: () => showPermissionDialog(row),
      updatePassword: () => showPasswordDialog(row)
    }
    commandMap[command]?.()
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
    const enumItem = enumStore.getEnumItemByCodeSync('GenderEnum', type)
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

  /** tableData 变化后（含翻页）再恢复勾选，避免被表格的 selection-change([]) 冲掉；短延迟确保表格已渲染 */
  watch(
    () => state.tableData,
    newData => {
      const ids = pendingRestoreIds.value
      if (!ids || !newData?.length) {
        if (ids && !newData?.length) pendingRestoreIds.value = null
        return
      }
      nextTick(() => {
        setTimeout(() => {
          doRestoreTableSelection(new Set(ids))
        }, 50)
      })
    },
    { flush: 'post' }
  )

  // 初始化
  onMounted(async () => {
    // 枚举选项
    const [userStatus, userGenders, organizationTypeOptions] = await Promise.all([
      enumStore.getEnumDataAsync('StatusEnum'),
      enumStore.getEnumDataAsync('GenderEnum'),
      enumStore.getEnumDataAsync('IamOrganizationTypeEnum')
    ])
    state.userStatus = userStatus
    state.userGenders = userGenders
    state.organizationTypeOptions = organizationTypeOptions

    if (organizationTypeOptions.length > 0) {
      state.searchForm.organizationType = organizationTypeOptions[0].code
    }

    await fetchData()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
    await calculateTreeHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
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
    height: 100%;
    min-height: 0;
    padding: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    :deep(.el-splitter) {
      height: 100%;
      min-height: 0;
    }
    :deep(.el-splitter-panel) {
      min-height: 0;
    }

    .box-card-tree-select {
      margin: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        padding: 12px;
      }
      .tree-body {
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .el-select {
        margin: 0 0 0 0;
        width: 100%;
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .user-main-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-card-form {
    margin: 0;
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
          flex: 1 1 280px;
          min-width: 100px;
          max-width: 280px;

          &.role-selector {
            min-width: 280px;

            // 优化标签间距
            :deep(.el-select__tags) {
              .el-tag {
                margin-right: 4px;
                margin-left: 0;
                padding: 0 6px;

                &:first-child {
                  margin-left: 0;
                }
              }
            }
          }

          &.shop-selector {
            min-width: 280px;

            // 优化标签间距
            :deep(.el-select__tags) {
              .el-tag {
                margin-right: 4px;
                margin-left: 0;
                padding: 0 6px;

                &:first-child {
                  margin-left: 0;
                }
              }
            }
          }

          // 创建时间和修改时间字段特殊宽度
          &.form-item-date-picker {
            flex: 1 1 320px;
            max-width: 320px;

            :deep(.el-date-editor) {
              width: 100%;
              max-width: 320px;
            }
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
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      gap: 8px;
    }

    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .operation-buttons-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .el-switch {
        margin-left: 8px;
      }
    }

    .table-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    :deep(.el-button) {
      margin: 0;
      margin-right: 2px;

      &:last-child {
        margin-right: 0;
      }
    }

    :deep(.el-dropdown) {
      margin-left: 2px;
    }
  }
</style>
