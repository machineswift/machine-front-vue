<template>
  <div ref="pageContainerRef" class="auth2-registered-client-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
          <div class="form-items-group">
            <el-form-item label="客户端ID:" prop="clientId" class="form-item-responsive">
              <el-input v-model="state.searchForm.clientId" placeholder="请输入客户端ID" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="客户端名称:" prop="clientName" class="form-item-responsive">
              <el-input v-model="state.searchForm.clientName" placeholder="请输入客户端名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.statusOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
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

          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearchForm" v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:PAGE_EXPAND']">
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
          <el-button
            type="primary"
            size="default"
            @click="openAddDialog"
            v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:CREATE']"
          >
            添加
          </el-button>
        </div>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          ref="tableRef"
          :data="state.tableData"
          border
          v-loading="state.loading"
          :height="tableHeight"
          stripe
          highlight-current-row
          class="auth2-registered-client-table"
        >
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="id" label="ID" align="center" v-if="false" fixed />
          <el-table-column prop="clientId" label="客户端ID" align="center" width="200" show-overflow-tooltip />
          <el-table-column prop="clientName" label="客户端名称" align="center" width="180" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" align="center" width="110">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="'ENABLE'"
                :inactive-value="'DISABLE'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="toggleStatus(row)"
                v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:UPDATE_STATUS']"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="130" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="130" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="修改时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="openDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:DETAIL']">
                  详情
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="openEditDialog(row)"
                  v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:UPDATE']"
                >
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="command => onDropdownCommand(command, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="delete"
                        divided
                        :disabled="!hasPermission(['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:DELETE'])"
                      >
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
          v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:PAGE_EXPAND']"
        />
      </div>

      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <IamAuth2RegisteredClientAddDialog v-model="state.dialog.addVisible" @success="handleAddSuccess" />
    <IamAuth2RegisteredClientEditDialog v-model="state.dialog.editVisible" :client-id="state.selectedClientId" @success="handleEditSuccess" />
    <IamAuth2RegisteredClientDetailDialog v-model="state.dialog.detailVisible" :client-id="state.selectedClientId" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT'
  })

  import { reactive, onMounted, ref, nextTick, watch, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Delete } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { IamAuth2RegisteredClientApi } from '@/modules/iam/auth2RegisteredClient/api/IamAuth2RegisteredClient.api'
  import IamAuth2RegisteredClientAddDialog from '@/modules/iam/auth2RegisteredClient/IamAuth2RegisteredClientAddDialog.vue'
  import IamAuth2RegisteredClientEditDialog from '@/modules/iam/auth2RegisteredClient/IamAuth2RegisteredClientEditDialog.vue'
  import IamAuth2RegisteredClientDetailDialog from '@/modules/iam/auth2RegisteredClient/IamAuth2RegisteredClientDetailDialog.vue'
  import type {
    IamAuth2RegisteredClientListResponseVo,
    IamAuth2RegisteredClientPageResponse,
    IamAuth2RegisteredClientPageQueryRequestVo
  } from '@/modules/iam/auth2RegisteredClient/type/IamAuth2RegisteredClient.type'

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    loading: false,
    showSearchCard: true,
    selectedClientId: '',

    // 枚举选项
    statusOptions: [] as Array<{ code: string; message: string }>,

    // 表格数据
    tableData: [] as IamAuth2RegisteredClientListResponseVo[],

    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      clientId: '',
      clientName: '',
      status: null as string | null,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },

    // 对话框状态
    dialog: {
      addVisible: false,
      editVisible: false,
      detailVisible: false
    }
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)
  const tableRef = ref()

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

  // 工具函数
  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 业务逻辑
  const buildQueryParams = (): IamAuth2RegisteredClientPageQueryRequestVo => {
    return {
      current: state.pagination.current,
      size: state.pagination.size,
      ...(state.searchForm.clientId && { clientId: state.searchForm.clientId }),
      ...(state.searchForm.clientName && { clientName: state.searchForm.clientName }),
      ...(state.searchForm.status && { status: state.searchForm.status }),
      ...(state.searchForm.updateStartTime && { updateStartTime: state.searchForm.updateStartTime }),
      ...(state.searchForm.updateEndTime && { updateEndTime: state.searchForm.updateEndTime })
    }
  }

  const fetchData = async (): Promise<void> => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const response: IamAuth2RegisteredClientPageResponse = await IamAuth2RegisteredClientApi.pageExpand(params)

      state.tableData = response.records
      state.pagination.total = response.total
    } catch (error) {
      console.error('获取客户端列表失败:', error)
    } finally {
      state.loading = false
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

  const handleSearch = (): void => {
    state.pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const resetSearchForm = (): void => {
    searchFormRef.value?.resetFields()
    state.searchForm.updateTimeRange = []
    state.searchForm.updateStartTime = undefined
    state.searchForm.updateEndTime = undefined
    handleSearch()
  }

  const handlePageChange = async (): Promise<void> => {
    await fetchData()
  }

  const handleSizeChange = (newSize: number): void => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const openAddDialog = (): void => {
    state.selectedClientId = ''
    state.dialog.addVisible = true
  }

  const openEditDialog = (row: IamAuth2RegisteredClientListResponseVo): void => {
    state.selectedClientId = row.id
    state.dialog.editVisible = true
  }

  const openDetailDialog = (row: IamAuth2RegisteredClientListResponseVo): void => {
    state.selectedClientId = row.id
    state.dialog.detailVisible = true
  }

  const handleAddSuccess = async (): Promise<void> => {
    await fetchData()
  }

  const handleEditSuccess = async (): Promise<void> => {
    await fetchData()
  }

  const onDropdownCommand = (command: string | number | object, row: IamAuth2RegisteredClientListResponseVo): void => {
    handleDropdownCommand(String(command), row)
  }

  const handleDropdownCommand = (command: string, row: IamAuth2RegisteredClientListResponseVo): void => {
    const commandMap: Record<string, () => void> = {
      delete: () => handleDeleteClient(row)
    }
    commandMap[command]?.()
  }

  // 切换状态
  const toggleStatus = async (row: IamAuth2RegisteredClientListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '禁用' : '启用'}客户端 "${row.clientName}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await IamAuth2RegisteredClientApi.updateStatus({ id: row.id, status: row.status })
      ElMessage.success(`${row.status === 'ENABLE' ? '启用' : '禁用'}成功`)
    } catch (error: unknown) {
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      if (error !== 'cancel') {
        console.error('切换客户端状态失败', error)
      }
    }
  }

  // 删除客户端
  const handleDeleteClient = async (row: IamAuth2RegisteredClientListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除客户端 "${row.clientName}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await IamAuth2RegisteredClientApi.deleteClient({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        console.error('删除客户端失败', error)
      }
    }
  }

  onMounted(async () => {
    state.statusOptions = await enumStore.getEnumDataAsync('StatusEnum')

    await fetchData()
    await nextTick()
    setupResizeObserver()
    calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
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

  .auth2-registered-client-page {
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

    :deep(.el-table__header-wrapper) {
      z-index: 1;
    }

    :deep(.el-pagination) {
      justify-content: flex-end;
    }
  }
</style>
