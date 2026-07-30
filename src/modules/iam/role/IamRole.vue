<template>
  <div ref="pageContainerRef" class="role-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <!-- 表单项目组 - Modified for responsive layout -->
          <div class="form-items-group">
            <el-form-item label="角色名称:" prop="name" class="form-item-responsive">
              <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="角色编码:" prop="code" class="form-item-responsive">
              <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="角色类型:" prop="type" class="form-item-responsive">
              <el-select v-model="searchForm.type" placeholder="选择角色类型" clearable>
                <el-option v-for="option in state.roleTypes" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.roleStatus" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建人:" prop="createUserIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedCreateUserIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择创建人"
                @remove-tag="removeQueryCreateUser"
                @clear="clearSelectorAllCreateUsers"
              >
                <el-option v-for="user in state.selectedCreateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showCreateUserSelectorDialog"
                    v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="修改人:" prop="updateUserIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedUpdateUserIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择修改人"
                @remove-tag="removeQueryUpdateUser"
                @clear="clearSelectorAllUpdateUsers"
              >
                <el-option v-for="user in state.selectedUpdateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showUpdateUserSelectorDialog"
                    v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleCreateTimeRangeChange"
              />
            </el-form-item>
            <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="searchForm.updateTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleUpdateTimeRangeChange"
              />
            </el-form-item>
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearchForm" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:PAGE_EXPAND']">
                <el-icon>
                  <Refresh />
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </transition>

    <!-- 数据卡片 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <!-- 操作按钮 -->
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-button type="primary" size="default" @click="openAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.roleList"
          border
          v-loading="state.isLoading"
          :height="tableHeight"
          style="margin: 10px 0"
          stripe
          highlight-current-row
          class="role-table"
        >
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="id" label="ID" align="center" v-if="false" fixed />
          <el-table-column prop="name" label="角色名称" align="center" width="160" fixed show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.name }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="角色编码" align="center" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.code" :content="row.code" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.code }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="角色类型" align="center" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="getRoleTypeLabel(row.type)" :content="getRoleTypeLabel(row.type)" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ getRoleTypeLabel(row.type) }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" align="center" width="120">
            <template #default="{ row }">
              <el-switch
                v-if="!row.defaultRole"
                v-model="row.status"
                :active-value="'ENABLE'"
                :inactive-value="'DISABLE'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="toggleRoleStatus(row)"
                v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE_STATUS']"
              />
              <el-tooltip v-if="row.defaultRole" content="默认角色不可操作" placement="top">
                <el-switch
                  v-model="row.status"
                  :active-value="'ENABLE'"
                  :inactive-value="'DISABLE'"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  :disabled="row.defaultRole"
                  v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE_STATUS']"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="defaultRole" label="默认角色" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="row.defaultRole ? 'success' : 'info'">
                {{ row.defaultRole ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="userNumber" label="用户数" align="center" width="100" />
          <el-table-column prop="createName" label="创建人" align="center" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.createName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" width="180">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.updateName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="openDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="openEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE']">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="onRoleDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="updatePermission" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE_PERMISSION'])">
                        <el-icon><Key /></el-icon>
                        <span>修改权限</span>
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="!row.defaultRole"
                        command="delete"
                        divided
                        :disabled="!hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:DELETE'])"
                      >
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="row.defaultRole" disabled divided>
                        <el-icon><Delete /></el-icon>
                        <span>删除（默认角色不可操作）</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
          ref="paginationRef"
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[20, 50, 100, 200, 500, 1000]"
          :background="true"
          layout="prev, pager, next, jumper, ->, total, sizes"
          :total="pagination.total"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
          v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:PAGE_EXPAND']"
        />
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <IamRoleAddDialog v-model="state.dialog.addVisible" @success="handleAddSuccess" />
    <IamRoleEditDialog v-model="state.dialog.editVisible" :role-id="state.selectedRoleId" @refresh="fetchData" />
    <IamRoleEditPermissionDialog v-model="state.dialog.editPermissionVisible" :role-id="state.selectedRoleId" />
    <IamRoleDetailDialog v-model="state.dialog.detailVisible" :role-id="state.selectedRoleId" />
    <IamUserQuickSelectDialog
      v-model="state.createUserDialogVisible"
      @confirm="handleCreateUserSelect"
      :multiple="true"
      :selected-users="state.selectedCreateUsers"
    />
    <IamUserQuickSelectDialog
      v-model="state.updateUserDialogVisible"
      @confirm="handleUpdateUserSelect"
      :multiple="true"
      :selected-users="state.selectedUpdateUsers"
    />
  </div>
</template>

<script setup lang="ts">
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE'
  })
  import { reactive, onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Key, Delete } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { IamRoleApi } from '@/modules/iam/role/api/IamRole.api'
  import IamRoleAddDialog from '@/modules/iam/role/IamRoleAddDialog.vue'
  import IamRoleDetailDialog from '@/modules/iam/role/IamRoleDetailDialog.vue'
  import IamRoleEditDialog from '@/modules/iam/role/IamRoleEditDialog.vue'
  import IamRoleEditPermissionDialog from '@/modules/iam/role/IamRoleEditPermissionDialog.vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type {
    IamRoleExpandPageResponse,
    IamRoleDetailResponseVo,
    IamRoleQueryPageRequestVo,
    IamRoleExpandListResponseVo,
    IamRoleUpdateStatusRequestVo,
    IamUserSimpleListResponseVo
  } from '@/modules/iam/types'
  import IamUserQuickSelectDialog from '@/modules/iam/user/IamUserQuickSelectDialog.vue'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 状态管理
  const state = reactive({
    isLoading: false,
    showSearchCard: true,
    selectedRoleId: '',

    //枚举状态
    roleStatus: [],
    roleTypes: [],

    // 搜索条件
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as IamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as IamUserSimpleListResponseVo[],

    //表格数据
    roleList: [] as IamRoleExpandListResponseVo[],

    dialog: {
      addVisible: false,
      editPermissionVisible: false,
      editVisible: false,
      detailVisible: false
    }
  })

  // 分页数据
  const pagination = reactive<IamRoleQueryPageRequestVo>({
    current: 1,
    size: 20,
    total: 0
  })

  // 搜索表单
  const searchForm = reactive({
    name: '',
    code: '',
    type: null as string | null,
    status: null as string | null,
    createUserIdSet: [] as string[],
    updateUserIdSet: [] as string[],
    createTimeRange: [] as number[],
    createStartTime: undefined as number | undefined,
    createEndTime: undefined as number | undefined,
    updateTimeRange: [] as number[],
    updateStartTime: undefined as number | undefined,
    updateEndTime: undefined as number | undefined
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  // 表格高度 - 初始为0，等计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true

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
    if (isFirstCalculation && tableHeight.value > 0) {
      tableHeightReady.value = true
      isFirstCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  // 计算属性
  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || ({ id } as IamUserSimpleListResponseVo))
    }
  })

  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || ({ id } as IamUserSimpleListResponseVo))
    }
  })

  // 工具函数
  const getRoleTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('IamRoleTypeEnum', type)
    return enumItem?.message || type
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 业务逻辑
  const buildQueryParams = (): IamRoleQueryPageRequestVo => {
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.type && { type: searchForm.type }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
      ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
  }

  const fetchData = async (): Promise<void> => {
    try {
      state.isLoading = true
      const params = buildQueryParams()
      const response: IamRoleExpandPageResponse = await IamRoleApi.pageExpand(params)

      state.roleList = response.records
      pagination.total = response.total
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      state.isLoading = false
    }
  }

  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      searchForm.createStartTime = value[0]
      searchForm.createEndTime = value[1]
    } else {
      searchForm.createStartTime = undefined
      searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      searchForm.updateStartTime = value[0]
      searchForm.updateEndTime = value[1]
    } else {
      searchForm.updateStartTime = undefined
      searchForm.updateEndTime = undefined
    }
  }

  const handleSearch = (): void => {
    pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const resetSearchForm = (): void => {
    searchFormRef.value?.resetFields()
    searchForm.createTimeRange = []
    searchForm.createStartTime = undefined
    searchForm.createEndTime = undefined
    searchForm.updateTimeRange = []
    searchForm.updateStartTime = undefined
    searchForm.updateEndTime = undefined
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    handleSearch()
  }

  const handlePageChange = (): void => fetchData()
  const handlePageSizeChange = (newSize: number): void => {
    pagination.size = newSize
    pagination.current = 1
    fetchData()
  }

  const openAddDialog = (): void => {
    state.dialog.addVisible = true
  }

  const showPermissionDialog = (row: IamRoleExpandListResponseVo) => {
    state.selectedRoleId = row.id
    state.dialog.editPermissionVisible = true
  }

  /** 处理角色下拉菜单命令 */
  const onRoleDropdownCommand = (command: string | number | object, row: IamRoleExpandListResponseVo) => {
    handleRoleDropdownCommand(String(command), row)
  }

  /** 处理角色下拉菜单命令 */
  const handleRoleDropdownCommand = (command: string, row: IamRoleExpandListResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updatePermission: () => showPermissionDialog(row),
      delete: () => handleDeleteRole(row)
    }
    commandMap[command]?.()
  }

  const handleAddSuccess = (): void => fetchData()

  const openEditDialog = (role: IamRoleExpandListResponseVo): void => {
    state.selectedRoleId = role.id
    state.dialog.editVisible = true
  }

  const openDetailDialog = (role: IamRoleExpandListResponseVo): void => {
    state.selectedRoleId = role.id
    state.dialog.detailVisible = true
  }

  // 切换角色状态
  const toggleRoleStatus = async (role: IamRoleExpandListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要${role.status === 'ENABLE' ? '禁用' : '启用'}角色 "${role.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const params: IamRoleUpdateStatusRequestVo = {
        id: role.id,
        status: role.status
      }

      await IamRoleApi.updateStatus(params)
    } catch (error) {
      console.error('修改角色状态失败:', error)
      // 操作取消或失败时，恢复原来的状态
      role.status = role.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const handleDeleteRole = async (role: IamRoleDetailResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗? 此操作不可恢复！`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await IamRoleApi.destroy({ id: role.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除角色失败:', error)
      }
    }
  }

  // 创建人选择相关方法
  const showCreateUserSelectorDialog = () => {
    state.createUserDialogVisible = true
  }

  const clearSelectorAllCreateUsers = () => {
    state.selectedCreateUsers = []
  }

  const removeQueryCreateUser = (userId: string) => {
    state.selectedCreateUsers = state.selectedCreateUsers.filter(user => user.id !== userId)
  }

  const handleCreateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }

  // 修改人选择相关方法
  const showUpdateUserSelectorDialog = () => {
    state.updateUserDialogVisible = true
  }

  const clearSelectorAllUpdateUsers = () => {
    state.selectedUpdateUsers = []
  }

  const removeQueryUpdateUser = (userId: string) => {
    state.selectedUpdateUsers = state.selectedUpdateUsers.filter(user => user.id !== userId)
  }

  const handleUpdateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  // 初始化
  onMounted(async () => {
    const [roleStatus, roleTypes] = await Promise.all([enumStore.getEnumDataAsync('StatusEnum'), enumStore.getEnumDataAsync('IamRoleTypeEnum')])
    // 更新状态
    state.roleStatus = roleStatus
    state.roleTypes = roleTypes
    await fetchData()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  /* 添加动画效果 */
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

  .role-page {
    height: 100%;
    min-height: 0;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  .box-card-form {
    margin: 0;
    flex-shrink: 0;
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

          &.user-selector {
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

  // 优化表格行高
  .role-table {
    :deep(.el-table__body) {
      td {
        padding: 8px 0;
      }
    }

    :deep(.el-table__header) {
      th {
        padding: 8px 0;
      }
    }

    // 文本省略样式
    .text-ellipsis {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
</style>
