<template>
  <div class="webhook-task-page-div">
    <div class="webhook-task-main-content">
      <transition name="slide-fade">
        <el-card ref="searchCardRef" v-show="state.showSearchCard" class="box-card-form">
          <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
            <div class="form-items-group">
              <el-form-item label="接收端:" prop="webhookEndpointId" class="form-item-responsive">
                <el-select v-model="state.searchForm.webhookEndpointId" placeholder="请选择接收端" clearable filterable style="width: 100%">
                  <el-option v-for="option in endpointOptions" :key="option.id" :label="option.name" :value="option.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="事件编码:" prop="eventCode" class="form-item-responsive">
                <el-input v-model="state.searchForm.eventCode" placeholder="请输入事件编码" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="事件标识:" prop="eventKey" class="form-item-responsive">
                <el-input v-model="state.searchForm.eventKey" placeholder="请输入业务事件唯一标识" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="投递状态:" prop="status" class="form-item-responsive">
                <el-select v-model="state.searchForm.status" placeholder="请选择投递状态" clearable style="width: 100%">
                  <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
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
                  @change="handleCreateTimeChange"
                />
              </el-form-item>
            </div>
            <div class="button-group">
              <el-form-item>
                <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:PAGE_EXPAND']">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:PAGE_EXPAND']">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </el-card>
      </transition>

      <el-card ref="dataCardRef" class="box-card-data">
        <div ref="operationButtonsRef" class="operation-buttons">
          <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
          <div class="batch-actions">
            <span v-if="selectedRowCount" class="batch-hint">已选 {{ selectedRowCount }} 条</span>
            <el-button
              type="primary"
              :disabled="!selectedRowCount || state.batchRetrying"
              :loading="state.batchRetrying"
              @click="handleBatchRetry"
              v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:BATCH_RETRY']"
            >
              重新投递
            </el-button>
          </div>
        </div>

        <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
          <el-table
            :data="state.tableData"
            row-key="id"
            border
            style="margin: 10px 0"
            v-loading="state.loading"
            :height="tableHeight"
            stripe
            highlight-current-row
            class="webhook-task-table"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="48" align="center" fixed :selectable="isRetrySelectable" />
            <el-table-column label="序号" align="center" type="index" width="60" fixed />
            <el-table-column prop="webhookEndpointName" label="接收端" align="center" min-width="160">
              <template #default="{ row }">
                <el-tooltip v-if="row.webhookEndpointName" :content="row.webhookEndpointName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.webhookEndpointName }}</span>
                </el-tooltip>
                <span v-else>{{ row.webhookEndpointId || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="eventCode" label="事件编码" align="center" width="180">
              <template #default="{ row }">
                <span class="text-ellipsis" :title="row.eventCode">{{ row.eventCode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="eventKey" label="事件标识" align="center" min-width="200">
              <template #default="{ row }">
                <el-tooltip v-if="row.eventKey" :content="row.eventKey" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.eventKey }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="投递状态" align="center" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.status" :type="WEBHOOK_DELIVERY_TASK_STATUS_TAG_TYPE[row.status] || 'info'" size="small">
                  {{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS, row.status) }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="attemptCount" label="投递次数" align="center" width="100">
              <template #default="{ row }">{{ row.attemptCount ?? 0 }}</template>
            </el-table-column>
            <el-table-column prop="lastAttemptTime" label="最近投递时间" align="center" width="170">
              <template #default="{ row }">{{ formatTime(row.lastAttemptTime) }}</template>
            </el-table-column>
            <el-table-column prop="nextRetryTime" label="下次重试时间" align="center" width="170">
              <template #default="{ row }">{{ formatTime(row.nextRetryTime) }}</template>
            </el-table-column>
            <el-table-column prop="successTime" label="投递成功时间" align="center" width="170">
              <template #default="{ row }">{{ formatTime(row.successTime) }}</template>
            </el-table-column>
            <el-table-column prop="createName" label="创建人" align="center" width="110">
              <template #default="{ row }">
                <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.createName }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="170">
              <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="190" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:DETAIL']">详情</el-button>
                  <el-button
                    v-if="isRetryableStatus(row.status)"
                    size="small"
                    type="primary"
                    link
                    @click="handleRetry(row)"
                    v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:RETRY']"
                  >
                    {{ row.status === 'PENDING' ? '立即投递' : '重新投递' }}
                  </el-button>
                  <el-button
                    v-if="row.status === 'PENDING'"
                    size="small"
                    type="danger"
                    link
                    @click="handleCancel(row)"
                    v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:CANCEL']"
                  >
                    取消
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            ref="paginationRef"
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :page-sizes="PAGE_SIZES"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:PAGE_EXPAND']"
          />
        </div>

        <div v-show="!tableHeightReady" class="table-placeholder">
          <el-skeleton :rows="8" animated />
        </div>
      </el-card>

      <BIamWebhookDeliveryTaskDetailDialog v-model="state.dialog.detail" :task-id="state.currentTaskId" />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'BIamWebhookTask'
  })

  import { computed, nextTick, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { useRoute } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { BIamWebhookDeliveryTaskApi } from './api/BIamWebhookDeliveryTask.api'
  import BIamWebhookDeliveryTaskDetailDialog from './BIamWebhookDeliveryTaskDetailDialog.vue'
  import { BIamWebhookEndpointApi } from '@/modules/biam/webhook/endpoint/api/BIamWebhookEndpoint.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { WEBHOOK_DELIVERY_TASK_STATUS_TAG_TYPE } from './type/BIamWebhookDeliveryTask.type'
  import type { BIamWebhookDeliveryTaskListResponseVo, BIamWebhookDeliveryTaskPageQueryRequestVo } from './type/BIamWebhookDeliveryTask.type'

  interface EndpointOption {
    id: string
    name: string
  }

  const enumStore = useDictionaryEnumStore()
  const route = useRoute()
  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS)

  const PAGE_SIZES = [20, 50, 100, 200]
  const ENDPOINT_OPTION_SIZE = 200

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const state = reactive({
    loading: false,
    batchRetrying: false,
    showSearchCard: true,
    currentTaskId: '',
    tableData: [] as BIamWebhookDeliveryTaskListResponseVo[],
    pagination: { current: 1, size: 20, total: 0 },
    searchForm: {
      webhookEndpointId: null as string | null,
      eventCode: '',
      eventKey: '',
      status: null as string | null,
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    dialog: {
      detail: false
    }
  })

  const endpointOptions = ref<EndpointOption[]>([])

  /** 可重新投递的状态：失败、过期、暂停、待投递（待投递为立即投递） */
  const RETRYABLE_STATUS = ['FAILED', 'EXPIRED', 'PAUSED', 'PENDING']
  const isRetryableStatus = (status?: string): boolean => !!status && RETRYABLE_STATUS.includes(status)
  const isRetrySelectable = (row: BIamWebhookDeliveryTaskListResponseVo): boolean => isRetryableStatus(row.status)

  const selectedRows = ref<BIamWebhookDeliveryTaskListResponseVo[]>([])
  const selectedRowCount = computed(() => selectedRows.value.length)

  const handleSelectionChange = (rows: BIamWebhookDeliveryTaskListResponseVo[]) => {
    selectedRows.value = rows
  }

  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  let isFirstActivation = true

  const { tableHeight, tableHeightReady, calculateTableHeight, setupResizeObserver } = useSplitCardHeights({
    dataCardRef,
    operationButtonsRef,
    paginationRef,
    observeRefs: [searchCardRef]
  })

  /** 接收端下拉选项（缺少接收端查询权限时跳过请求） */
  const loadEndpointOptions = async () => {
    if (!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:PAGE_EXPAND'])) return
    try {
      const res = await BIamWebhookEndpointApi.pageExpand({ current: 1, size: ENDPOINT_OPTION_SIZE })
      endpointOptions.value = (res.records || []).map(record => ({
        id: record.id,
        name: record.name || record.code
      }))
    } catch (error) {
      console.error('加载接收端选项失败', error)
    }
  }

  /** 兜底接收端选项：来源页面可能带上未出现在前 N 条下拉数据中的接收端 */
  const ensureEndpointOption = (id: string, name?: string) => {
    if (endpointOptions.value.some(item => item.id === id)) return
    endpointOptions.value = [{ id, name: name || id }, ...endpointOptions.value]
  }

  /** 上一次已生效的路由查询串，用于识别“重新下钻” */
  let appliedQueryKey: string | null = null

  /**
   * 支持从运行监控/接收端页带条件跳转：
   * webhookEndpointId、endpointName、status、eventCode、eventKey
   * <p>
   * 页面被 keep-alive 缓存，再次下钻时条件可能变化，因此每次激活都要重新应用；
   * 条件变化时先清空上一次的筛选，避免旧条件残留。返回是否发生了条件变化。
   */
  const applyRouteQuery = (): boolean => {
    const queryKey = JSON.stringify(route.query)
    if (queryKey === appliedQueryKey) return false
    appliedQueryKey = queryKey

    Object.assign(state.searchForm, {
      webhookEndpointId: null,
      eventCode: '',
      eventKey: '',
      status: null,
      createTimeRange: [] as number[],
      createStartTime: undefined,
      createEndTime: undefined
    })
    state.pagination.current = 1

    const { webhookEndpointId, endpointName, status, eventCode, eventKey } = route.query
    if (typeof webhookEndpointId === 'string' && webhookEndpointId) {
      state.searchForm.webhookEndpointId = webhookEndpointId
      ensureEndpointOption(webhookEndpointId, typeof endpointName === 'string' ? endpointName : undefined)
    }
    if (typeof status === 'string' && status) state.searchForm.status = status
    if (typeof eventCode === 'string' && eventCode) state.searchForm.eventCode = eventCode
    if (typeof eventKey === 'string' && eventKey) state.searchForm.eventKey = eventKey
    return true
  }

  const buildQueryParams = (): BIamWebhookDeliveryTaskPageQueryRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.webhookEndpointId && { webhookEndpointId: searchForm.webhookEndpointId }),
      ...(searchForm.eventCode && { eventCode: searchForm.eventCode }),
      ...(searchForm.eventKey && { eventKey: searchForm.eventKey }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.createStartTime != null && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime != null && { createEndTime: searchForm.createEndTime })
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await BIamWebhookDeliveryTaskApi.pageExpand(buildQueryParams())
      state.tableData = res.records || []
      state.pagination.total = res.total || 0
    } catch (error) {
      console.error('获取投递任务列表失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  const handleCreateTimeChange = () => {
    const range = state.searchForm.createTimeRange
    if (range?.length === 2) {
      state.searchForm.createStartTime = range[0]
      state.searchForm.createEndTime = range[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const resetSearch = () => {
    Object.assign(state.searchForm, {
      webhookEndpointId: null,
      eventCode: '',
      eventKey: '',
      status: null,
      createTimeRange: [] as number[],
      createStartTime: undefined,
      createEndTime: undefined
    })
    handleSearch()
  }

  const handlePageChange = () => fetchData()

  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const showDetailDialog = (row: BIamWebhookDeliveryTaskListResponseVo) => {
    state.currentTaskId = row.id
    state.dialog.detail = true
  }

  /** 重新投递：失败/过期/暂停任务重置为待投递；待投递任务立即发出一次投递 */
  const handleRetry = async (row: BIamWebhookDeliveryTaskListResponseVo) => {
    const immediate = row.status === 'PENDING'
    try {
      await ElMessageBox.confirm(
        immediate
          ? `确定要立即投递事件 ${row.eventCode || row.id} 吗？不会等待当前重试档位。`
          : `确定要重新投递事件 ${row.eventCode || row.id} 吗？任务将重置为待投递状态。`,
        immediate ? '立即投递' : '重新投递',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await BIamWebhookDeliveryTaskApi.retry({ id: row.id })
      ElMessage.success(immediate ? '已提交立即投递' : '已提交重新投递')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('重新投递失败', error)
    }
  }

  /** 批量重新投递：逐条处理，不可重投的状态由后端跳过 */
  const handleBatchRetry = async () => {
    const idList = selectedRows.value.map(row => row.id)
    if (!idList.length) return
    try {
      await ElMessageBox.confirm(`确定要重新投递选中的 ${idList.length} 条任务吗？待投递任务会立即投递，失败/过期/暂停任务会重置为待投递。`, '批量重新投递', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      state.batchRetrying = true
      const retried = await BIamWebhookDeliveryTaskApi.batchRetry({ idList })
      ElMessage.success(`已提交重新投递 ${retried ?? 0} 条任务`)
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('批量重新投递失败', error)
    } finally {
      state.batchRetrying = false
    }
  }

  /** 取消投递：仅待投递任务可取消 */
  const handleCancel = async (row: BIamWebhookDeliveryTaskListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要取消事件 ${row.eventCode || row.id} 的投递任务吗？取消后不再投递。`, '取消投递', {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
      })
      await BIamWebhookDeliveryTaskApi.cancel({ id: row.id })
      ElMessage.success('已取消投递任务')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('取消投递任务失败', error)
    }
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  onMounted(async () => {
    await Promise.all([loadStatusOptions(), loadEndpointOptions()])
    applyRouteQuery()
    await fetchData()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    applyRouteQuery()
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
  .webhook-task-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    box-sizing: border-box;
  }
  .webhook-task-main-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .box-card-form {
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
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
  }
  .box-card-data {
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
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
      gap: 8px;
    }

    .batch-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .batch-hint {
      font-size: 12px;
      color: var(--el-text-color-secondary);
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
    }
  }
  .webhook-task-table .text-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
</style>
