<template>
  <div ref="pageContainerRef" class="brand-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="名称:" prop="name" class="form-item-responsive">
              <el-input v-model="state.searchForm.name" placeholder="品牌名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="编码:" prop="code" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="品牌编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in brandStatus" :key="option.code" :label="option.message" :value="option.code" />
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
                v-model="state.searchForm.createTimeRange"
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
                v-model="state.searchForm.updateTimeRange"
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
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
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
        <el-button type="primary" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.tableData"
          border
          v-loading="state.loading"
          :height="tableHeight"
          style="margin: 10px 0"
          stripe
          highlight-current-row
          class="brand-table"
        >
          <el-table-column prop="id" label="ID" align="center" v-if="false" />
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="name" label="名称" align="center" width="160" fixed show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.name }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="编码" align="center" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.code" :content="row.code" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.code }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>

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
                v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE_STATUS']"
              />
            </template>
          </el-table-column>

          <el-table-column prop="logoUrl" label="LOGO" align="center" width="120">
            <template #default="{ row }">
              <DataBrandLogoPreview :url="row.logoUrl" />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" align="center" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.description" :content="row.description" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.description }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.createName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.updateName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="showDetail(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="showEdit(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE']">编辑</el-button>
                <el-dropdown trigger="click" @command="onBrandDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:DELETE'])">
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
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
        />
      </div>

      <!-- 骨架屏占位，避免高度突变 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <DataBrandAddDialog v-model="state.dialog.add" @success="fetchBrandList" />
    <DataBrandEditDialog v-model="state.dialog.edit" :brand-id="state.currentBrandId" @success="fetchBrandList" />
    <DataBrandDetailDialog v-model="state.dialog.detail" :brand-id="state.currentBrandId" />

    <BIamUserQuickSelectDialog
      v-model="state.createUserDialogVisible"
      @confirm="handleCreateUserSelect"
      :multiple="true"
      :selected-users="state.selectedCreateUsers"
    />
    <BIamUserQuickSelectDialog
      v-model="state.updateUserDialogVisible"
      @confirm="handleUpdateUserSelect"
      :multiple="true"
      :selected-users="state.selectedUpdateUsers"
    />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND'
  })
  import { ref, reactive, onMounted, onActivated, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Delete } from '@element-plus/icons-vue'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import type { DataBrandExpandPageResponse } from '@/modules/data/brand/type/DataBrand.type'
  import DataBrandAddDialog from '@/modules/data/brand/DataBrandAddDialog.vue'
  import DataBrandDetailDialog from '@/modules/data/brand/DataBrandDetailDialog.vue'
  import DataBrandEditDialog from '@/modules/data/brand/DataBrandEditDialog.vue'
  import DataBrandLogoPreview from '@/modules/data/brand/DataBrandLogoPreview.vue'
  import BIamUserQuickSelectDialog from '@/modules/biam/user/BIamUserQuickSelectDialog.vue'
  import type { BIamUserSimpleListResponseVo } from '@/modules/biam/user/type/BIamUser.type'

  const { options: brandStatus, load: loadBrandStatus } = useEnumOptions(DICT_STATUS)

  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentBrandId: '',
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    searchForm: {
      code: '',
      name: '',
      status: null as string | null,
      createUserIdSet: [] as string[],
      updateUserIdSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      edit: false,
      detail: false
    },
    tableData: [] as DataBrandExpandPageResponse['records'],
    // 新增的用户选择相关状态
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as BIamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as BIamUserSimpleListResponseVo[]
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref<HTMLElement | null>(null)
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  // 表格高度 - 初始不设置默认值，等待计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true
  let isFirstActivation = true

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

    // 只有当高度真正变化时才更新
    if (tableHeight.value !== newHeight) {
      tableHeight.value = newHeight
    }

    // 首次计算完成后，显示表格
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

  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || ({ id: id } as BIamUserSimpleListResponseVo))
    }
  })

  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || ({ id: id } as BIamUserSimpleListResponseVo))
    }
  })

  // 品牌下拉命令
  const onBrandDropdownCommand = async (command: string, row: { id: string; name: string }) => {
    if (command === 'delete') {
      await handleDelete(row)
    }
  }

  const handleDelete = async (row: { id: string; name: string }) => {
    try {
      await ElMessageBox.confirm(`确定要删除品牌 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await DataBrandApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchBrandList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除品牌失败', error)
        ElMessage.error('删除失败')
      }
    }
  }

  const fetchBrandList = async () => {
    try {
      state.loading = true
      const params = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.code && { code: state.searchForm.code }),
        ...(state.searchForm.name && { name: state.searchForm.name }),
        ...(state.searchForm.status && { status: state.searchForm.status }),
        ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
        ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) }),
        ...(state.searchForm.createStartTime && { createStartTime: state.searchForm.createStartTime }),
        ...(state.searchForm.createEndTime && { createEndTime: state.searchForm.createEndTime }),
        ...(state.searchForm.updateStartTime && { updateStartTime: state.searchForm.updateStartTime }),
        ...(state.searchForm.updateEndTime && { updateEndTime: state.searchForm.updateEndTime })
      }

      const res = await DataBrandApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchBrandList()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.createTimeRange = []
    state.searchForm.createStartTime = undefined
    state.searchForm.createEndTime = undefined
    state.searchForm.updateTimeRange = []
    state.searchForm.updateStartTime = undefined
    state.searchForm.updateEndTime = undefined
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    handleSearch()
  }

  const handlePageChange = () => fetchBrandList()
  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchBrandList()
  }

  const showAddDialog = () => {
    state.dialog.add = true
  }

  const showDetail = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.detail = true
  }

  const showEdit = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.edit = true
  }

  // 新增的时间范围处理方法
  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.createStartTime = value[0]
      state.searchForm.createEndTime = value[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.updateStartTime = value[0]
      state.searchForm.updateEndTime = value[1]
    } else {
      state.searchForm.updateStartTime = undefined
      state.searchForm.updateEndTime = undefined
    }
  }

  // 新增的用户选择相关方法
  const showCreateUserSelectorDialog = () => {
    state.createUserDialogVisible = true
  }

  const clearSelectorAllCreateUsers = () => {
    state.selectedCreateUsers = []
  }

  const removeQueryCreateUser = (userId: string) => {
    state.selectedCreateUsers = state.selectedCreateUsers.filter(user => user.id !== userId)
  }

  const handleCreateUserSelect = (users: BIamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }

  const showUpdateUserSelectorDialog = () => {
    state.updateUserDialogVisible = true
  }

  const clearSelectorAllUpdateUsers = () => {
    state.selectedUpdateUsers = []
  }

  const removeQueryUpdateUser = (userId: string) => {
    state.selectedUpdateUsers = state.selectedUpdateUsers.filter(user => user.id !== userId)
  }

  const handleUpdateUserSelect = (users: BIamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  const toggleStatus = async (row: { id: string; name: string; status: string }) => {
    try {
      const action = row.status === 'ENABLE' ? '禁用' : '启用'
      await ElMessageBox.confirm(`确定要${action}品牌 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DataBrandApi.updateStatus({
        id: row.id,
        status: row.status
      })

      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('修改品牌状态失败:', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  onMounted(async () => {
    await loadBrandStatus()
    await fetchBrandList()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchBrandList()
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

  .brand-page {
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
  }

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

      .el-form-item {
        margin-bottom: 0;
      }
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
  }

  // 优化表格行高
  .brand-table {
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
</style>
