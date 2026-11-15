<template>
  <div class="webhook-endpoint-page-div">
    <div class="webhook-endpoint-main-content">
      <transition name="slide-fade">
        <el-card ref="searchCardRef" v-show="state.showSearchCard" class="box-card-form">
          <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
            <div class="form-items-group">
              <el-form-item label="接收端编码:" prop="code" class="form-item-responsive">
                <el-input v-model="state.searchForm.code" placeholder="请输入接收端编码" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="接收端名称:" prop="name" class="form-item-responsive">
                <el-input v-model="state.searchForm.name" placeholder="请输入接收端名称" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="关联客户端:" prop="clientId" class="form-item-responsive">
                <el-select v-model="state.searchForm.clientId" placeholder="请选择关联客户端" clearable filterable style="width: 100%">
                  <el-option v-for="option in clientOptions" :key="option.clientId" :label="option.clientName" :value="option.clientId" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态:" prop="status" class="form-item-responsive">
                <el-select v-model="state.searchForm.status" placeholder="请选择状态" clearable style="width: 100%">
                  <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="投递状态:" prop="pauseFlag" class="form-item-responsive">
                <el-select v-model="state.searchForm.pauseFlag" placeholder="请选择投递状态" clearable style="width: 100%">
                  <el-option v-for="option in PAUSE_FILTER_OPTIONS" :key="String(option.value)" :label="option.label" :value="option.value" />
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
                <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:PAGE_EXPAND']">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:PAGE_EXPAND']">
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
          <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:CREATE']">新增</el-button>
          <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
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
            class="webhook-endpoint-table"
          >
            <el-table-column label="序号" align="center" type="index" width="60" fixed />
            <el-table-column prop="code" label="接收端编码" align="center" width="180">
              <template #default="{ row }">
                <span class="text-ellipsis" :title="row.code">{{ row.code || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="接收端名称" align="center" min-width="160">
              <template #default="{ row }">
                <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.name }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="clientName" label="关联客户端" align="center" min-width="180">
              <template #default="{ row }">
                <el-tooltip v-if="row.clientName" :content="row.clientName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.clientName }}</span>
                </el-tooltip>
                <span v-else>{{ row.clientId || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="endpointUrl" label="接收地址" align="left" min-width="220">
              <template #default="{ row }">
                <div v-if="row.endpointUrl" class="endpoint-url-cell">
                  <el-tooltip :content="row.endpointUrl" placement="top" :append-to-body="true">
                    <span class="text-ellipsis">{{ row.endpointUrl }}</span>
                  </el-tooltip>
                  <el-button link type="primary" class="copy-btn" title="复制接收地址" @click="copyEndpointUrl(row.endpointUrl)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center" width="110">
              <template #header>
                <el-tooltip content="接收端配置是否生效：禁用后不再产生新的投递任务，并停止投递" placement="top">
                  <span class="header-with-help">
                    状态
                    <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                  </span>
                </el-tooltip>
              </template>
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="'ENABLE'"
                  :inactive-value="'DISABLE'"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  @change="toggleStatus(row)"
                  v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:UPDATE_STATUS']"
                />
              </template>
            </el-table-column>
            <el-table-column prop="pauseFlag" label="投递状态" align="center" width="110">
              <template #header>
                <el-tooltip content="人工暂停开关：暂停只停止投递，接收端配置与未完成任务保留，恢复后继续投递" placement="top">
                  <span class="header-with-help">
                    投递状态
                    <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                  </span>
                </el-tooltip>
              </template>
              <template #default="{ row }">
                <el-switch
                  v-model="row.pauseFlag"
                  :active-value="false"
                  :inactive-value="true"
                  active-text="正常"
                  inactive-text="暂停"
                  inline-prompt
                  @change="togglePause(row)"
                  v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:UPDATE_PAUSE']"
                />
              </template>
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
            <el-table-column prop="updateName" label="修改人" align="center" width="110">
              <template #default="{ row }">
                <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.updateName }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center" width="170">
              <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="230" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:DETAIL']">详情</el-button>
                  <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:UPDATE']">
                    编辑
                  </el-button>
                  <el-dropdown
                    trigger="click"
                    placement="bottom-end"
                    @command="(command: string | number | object) => handleRowDropdownCommand(command as string, row)"
                  >
                    <el-button size="small" type="info">
                      更多
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="subscription" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:UPDATE_SUBSCRIPTION'])">
                          <el-icon><Connection /></el-icon>
                          <span>订阅关系</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="deliveryTask" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:PAGE_EXPAND'])">
                          <el-icon><Promotion /></el-icon>
                          <span>投递任务</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="monitor" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:ENDPOINT_PAGE_EXPAND'])">
                          <el-icon><Odometer /></el-icon>
                          <span>运行监控</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided :disabled="!canDelete(row)">
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
            :page-sizes="PAGE_SIZES"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:PAGE_EXPAND']"
          />
        </div>

        <div v-show="!tableHeightReady" class="table-placeholder">
          <el-skeleton :rows="8" animated />
        </div>
      </el-card>

      <BIamWebhookEndpointAddDialog v-model="state.dialog.add" :client-options="clientOptions" @success="fetchData" />
      <BIamWebhookEndpointEditDialog v-model="state.dialog.edit" :endpoint-id="state.currentEndpointId" :client-options="clientOptions" @success="fetchData" />
      <BIamWebhookEndpointDetailDialog v-model="state.dialog.detail" :endpoint-id="state.currentEndpointId" />
      <BIamWebhookEndpointSubscriptionDialog
        v-model="state.dialog.subscription"
        :endpoint-id="state.currentEndpointId"
        :endpoint-name="state.currentEndpointName"
        @success="fetchData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'BIamWebhookEndpoint'
  })

  import { nextTick, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Connection, CopyDocument, Delete, Odometer, Promotion, QuestionFilled } from '@element-plus/icons-vue'
  import { BIamWebhookEndpointApi } from './api/BIamWebhookEndpoint.api'
  import BIamWebhookEndpointAddDialog from './BIamWebhookEndpointAddDialog.vue'
  import BIamWebhookEndpointEditDialog from './BIamWebhookEndpointEditDialog.vue'
  import BIamWebhookEndpointDetailDialog from './BIamWebhookEndpointDetailDialog.vue'
  import BIamWebhookEndpointSubscriptionDialog from './BIamWebhookEndpointSubscriptionDialog.vue'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/identityCenter/registeredClient/api/BIamAuth2RegisteredClient.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import type { BIamWebhookEndpointListResponseVo, BIamWebhookEndpointPageQueryRequestVo } from './type/BIamWebhookEndpoint.type'
  import type { BIamWebhookEndpointClientOption } from './type/BIamWebhookEndpoint.type'

  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_STATUS)

  const router = useRouter()

  const PAGE_SIZES = [20, 50, 100, 200]
  const CLIENT_OPTION_SIZE = 200

  /** 投递状态筛选项：pauseFlag=true 表示人工暂停投递 */
  const PAUSE_FILTER_OPTIONS = [
    { label: '正常', value: false },
    { label: '暂停', value: true }
  ]

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentEndpointId: '',
    currentEndpointName: '',
    tableData: [] as BIamWebhookEndpointListResponseVo[],
    pagination: { current: 1, size: 20, total: 0 },
    searchForm: {
      code: '',
      name: '',
      clientId: null as string | null,
      status: null as string | null,
      pauseFlag: null as boolean | null,
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      edit: false,
      detail: false,
      subscription: false
    }
  })

  const clientOptions = ref<BIamWebhookEndpointClientOption[]>([])

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

  /** 关联客户端下拉（仅启用状态的客户端可用于新增接收端） */
  const loadClientOptions = async () => {
    // 缺少客户端查询权限时不做请求，避免页面加载即弹权限错误
    if (!hasPermission(['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:PAGE_EXPAND'])) return
    try {
      const res = await BIamAuth2RegisteredClientApi.pageExpand({
        current: 1,
        size: CLIENT_OPTION_SIZE,
        status: 'ENABLE'
      })
      clientOptions.value = (res.records || []).map(record => ({
        clientId: record.clientId,
        clientName: record.clientName
      }))
    } catch (error) {
      console.error('加载关联客户端失败', error)
    }
  }

  const buildQueryParams = (): BIamWebhookEndpointPageQueryRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.clientId && { clientId: searchForm.clientId }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(typeof searchForm.pauseFlag === 'boolean' && { pauseFlag: searchForm.pauseFlag }),
      ...(searchForm.createStartTime != null && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime != null && { createEndTime: searchForm.createEndTime })
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await BIamWebhookEndpointApi.pageExpand(buildQueryParams())
      state.tableData = res.records || []
      state.pagination.total = res.total || 0
    } catch (error) {
      console.error('获取接收端列表失败', error)
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
      code: '',
      name: '',
      clientId: null,
      status: null,
      pauseFlag: null,
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

  /** 启用状态的接收端不允许删除 */
  const canDelete = (row: BIamWebhookEndpointListResponseVo): boolean => row.status !== 'ENABLE' && hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:DELETE'])

  const showAddDialog = () => {
    state.currentEndpointId = ''
    state.currentEndpointName = ''
    state.dialog.add = true
  }

  const showDetailDialog = (row: BIamWebhookEndpointListResponseVo) => {
    state.currentEndpointId = row.id
    state.dialog.detail = true
  }

  const showEditDialog = (row: BIamWebhookEndpointListResponseVo) => {
    state.currentEndpointId = row.id
    state.dialog.edit = true
  }

  const showSubscriptionDialog = (row: BIamWebhookEndpointListResponseVo) => {
    state.currentEndpointId = row.id
    state.currentEndpointName = row.name
    state.dialog.subscription = true
  }

  /** 复制接收地址，便于对接方直接粘贴 */
  const copyEndpointUrl = async (url?: string) => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      ElMessage.success('接收地址已复制')
    } catch (error) {
      console.error('复制接收地址失败', error)
      ElMessage.error('复制失败，请手动选择复制')
    }
  }

  /** 下钻到投递任务页：带接收端与名称，任务页会自动应用筛选 */
  const goDeliveryTasks = (row: BIamWebhookEndpointListResponseVo) => {
    router.push({
      path: '/admin/system/webhook/task',
      query: { webhookEndpointId: row.id, endpointName: row.name || row.code }
    })
  }

  /** 下钻到运行监控页：带接收端ID（概览/趋势过滤）与编码（健康度表过滤） */
  const goMonitor = (row: BIamWebhookEndpointListResponseVo) => {
    router.push({
      path: '/admin/system/webhook/monitor',
      query: { webhookEndpointId: row.id, endpointName: row.name || row.code, endpointCode: row.code }
    })
  }

  const handleRowDropdownCommand = (command: string, row: BIamWebhookEndpointListResponseVo) => {
    const map: Record<string, () => void> = {
      subscription: () => showSubscriptionDialog(row),
      deliveryTask: () => goDeliveryTasks(row),
      monitor: () => goMonitor(row),
      delete: () => handleDelete(row)
    }
    map[command]?.()
  }

  const toggleStatus = async (row: BIamWebhookEndpointListResponseVo) => {
    const nextStatus = row.status
    const actionText = nextStatus === 'ENABLE' ? '启用' : '禁用'
    try {
      await ElMessageBox.confirm(`确定要${actionText}接收端 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEndpointApi.updateStatus({ id: row.id, status: nextStatus })
      ElMessage.success(`${actionText}成功`)
    } catch (error: unknown) {
      row.status = nextStatus === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      if (error !== 'cancel') console.error('切换接收端状态失败', error)
    }
  }

  const togglePause = async (row: BIamWebhookEndpointListResponseVo) => {
    const nextPauseFlag = row.pauseFlag
    const actionText = nextPauseFlag ? '暂停投递' : '恢复投递'
    try {
      await ElMessageBox.confirm(`确定要${actionText}接收端 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEndpointApi.updatePause({ id: row.id, pauseFlag: nextPauseFlag })
      ElMessage.success(`${actionText}成功`)
    } catch (error: unknown) {
      row.pauseFlag = !nextPauseFlag
      if (error !== 'cancel') console.error('切换接收端投递状态失败', error)
    }
  }

  const handleDelete = async (row: BIamWebhookEndpointListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除接收端 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEndpointApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('删除接收端失败', error)
    }
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  onMounted(async () => {
    await Promise.all([loadStatusOptions(), loadClientOptions()])
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
  .webhook-endpoint-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    box-sizing: border-box;
  }
  .webhook-endpoint-main-content {
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
      gap: 8px;
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
  .webhook-endpoint-table .text-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .webhook-endpoint-table .header-with-help {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    cursor: help;
  }
  .webhook-endpoint-table .header-help-icon {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  .webhook-endpoint-table .endpoint-url-cell {
    display: flex;
    gap: 4px;
    align-items: center;

    .text-ellipsis {
      flex: 1;
      min-width: 0;
    }

    .copy-btn {
      flex-shrink: 0;
      margin: 0;
      padding: 0;
    }
  }
</style>
