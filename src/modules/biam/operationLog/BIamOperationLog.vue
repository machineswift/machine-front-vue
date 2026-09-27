<template>
  <div ref="pageContainerRef" class="operation-log-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="操作人:" prop="userIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedOperatorIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择操作人"
                @remove-tag="removeQueryOperator"
                @clear="clearSelectorAllOperators"
              >
                <el-option v-for="user in state.selectedOperators" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showOperatorSelectorDialog"
                    v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item label="手机号:" prop="phone" class="form-item-responsive">
              <el-input v-model="state.searchForm.phone" placeholder="请输入手机号" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="姓名:" prop="realName" class="form-item-responsive">
              <el-input v-model="state.searchForm.realName" placeholder="请输入姓名" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="操作来源:" prop="operateSource" class="form-item-responsive">
              <el-select v-model="state.searchForm.operateSource" placeholder="选择操作来源" clearable>
                <el-option v-for="option in operateSourceOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作模块:" prop="module" class="form-item-responsive">
              <el-select v-model="state.searchForm.module" placeholder="选择操作模块" clearable>
                <el-option v-for="option in moduleOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="模块实体:" prop="moduleEntity" class="form-item-responsive">
              <el-select v-model="state.searchForm.moduleEntity" placeholder="选择模块实体" clearable>
                <el-option v-for="option in moduleEntityOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作分类:" prop="operateType" class="form-item-responsive">
              <el-select v-model="state.searchForm.operateType" placeholder="选择操作分类" clearable>
                <el-option v-for="option in operateTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作名称:" prop="operateName" class="form-item-responsive">
              <el-input v-model="state.searchForm.operateName" placeholder="请输入操作名称" clearable />
            </el-form-item>
            <el-form-item label="实体ID:" prop="moduleEntityId" class="form-item-responsive">
              <el-input v-model="state.searchForm.moduleEntityId" placeholder="请输入业务实体ID" clearable />
            </el-form-item>
            <el-form-item label="业务状态:" prop="actionStatus" class="form-item-responsive">
              <el-select v-model="state.searchForm.actionStatus" placeholder="选择业务状态" clearable>
                <el-option v-for="option in actionStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="HTP状态:" prop="httpStatus" class="form-item-responsive">
              <el-input-number v-model="state.searchForm.httpStatus" :min="0" :max="999" placeholder="状态码" controls-position="right" style="width: 100%" />
            </el-form-item>
            <el-form-item label="请求路径:" prop="requestPath" class="form-item-responsive">
              <el-input v-model="state.searchForm.requestPath" placeholder="请输入请求路径" clearable />
            </el-form-item>
            <el-form-item label="链路追踪:" prop="traceId" class="form-item-responsive">
              <el-input v-model="state.searchForm.traceId" placeholder="请输入链路追踪ID" clearable />
            </el-form-item>
            <el-form-item label="客户端IP:" prop="clientIp" class="form-item-responsive">
              <el-input v-model="state.searchForm.clientIp" placeholder="请输入客户端IP" clearable />
            </el-form-item>
            <el-form-item label="操作时间:" prop="timeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="state.searchForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="x"
              />
            </el-form-item>
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleResetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG:PAGE_EXPAND']">
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
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table :data="state.tableData" border v-loading="state.loading" :height="tableHeight" stripe highlight-current-row>
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="username" label="用户名" align="center" width="110" fixed />
          <el-table-column prop="realName" label="姓名" align="center" width="100" />
          <el-table-column prop="phone" label="手机号" align="center" width="120" />
          <el-table-column prop="operateSource" label="操作来源" align="center" width="120">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_OPERATE_SOURCE, row.operateSource) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="操作模块" align="center" width="160">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_MODULE, row.module) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="moduleEntity" label="模块实体" align="center" width="140">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_MODULE_ENTITY, row.moduleEntity) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operateType" label="操作分类" align="center" width="100">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_ACTION_TYPE, row.operateType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operateName" label="操作名称" align="center" width="140" />
          <el-table-column prop="moduleEntityId" label="实体ID" align="center" width="320" />
          <el-table-column prop="actionStatus" label="业务状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="row.actionStatus === 'SUCCESS' ? 'success' : 'danger'">
                {{ enumStore.getEnumLabel(DICT_ACTION_STATUS, row.actionStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="httpMethod" label="HTTP方法" align="center" width="100" />
          <el-table-column prop="httpStatus" label="HTTP状态码" align="center" width="110">
            <template #default="{ row }">
              <span :class="row.httpStatus >= 400 ? 'http-status-error' : ''">{{ row.httpStatus ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="requestPath" label="请求路径" align="center" width="220" min-width="160">
            <template #default="{ row }">
              <el-tooltip v-if="row.requestPath" :content="row.requestPath" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.requestPath }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" align="center" width="220" min-width="160">
            <template #default="{ row }">
              <el-tooltip v-if="row.content" :content="row.content" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.content }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="clientIp" label="客户端IP" align="center" width="130" />
          <el-table-column prop="costTime" label="耗时(ms)" align="center" width="100">
            <template #default="{ row }">
              <span>{{ row.costTime ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="110" v-if="false" />
          <el-table-column prop="createTime" label="操作时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="100" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="showDetail(row)" v-hasPermission="['MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG:DETAIL']">详情</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
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
          v-hasPermission="['MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG:PAGE_EXPAND']"
        />
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <BIamOperationLogDetail v-model="state.detailVisible" :log-id="state.selectedLogId" />

    <!-- 操作人选择对话框 -->
    <BIamUserQuickSelectDialog
      v-model="state.operatorDialogVisible"
      @confirm="handleOperatorSelect"
      :multiple="true"
      :selected-users="state.selectedOperators"
    />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG'
  })
  import { onMounted, onActivated, reactive, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import BIamOperationLogDetail from '@/modules/biam/operationLog/BIamOperationLogDetail.vue'
  import { BIamOperationLogApi } from '@/modules/biam/operationLog/api/BIamOperationLog.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_MODULE, DICT_MODULE_ENTITY, DICT_OPERATE_SOURCE, DICT_ACTION_TYPE, DICT_ACTION_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import type {
    BIamOperationLogExpandListResponseVo,
    BIamOperationLogExpandPageResponse,
    BIamOperationLogQueryPageRequestVo
  } from '@/modules/biam/operationLog/type/BIamOperationLog.type'
  import BIamUserQuickSelectDialog from '@/modules/biam/user/BIamUserQuickSelectDialog.vue'
  import type { BIamUserSimpleListResponseVo } from '@/modules/biam/user/type/BIamUser.type'

  const enumStore = useDictionaryEnumStore()

  const { options: operateSourceOptions, load: loadOperateSourceOptions } = useEnumOptions(DICT_OPERATE_SOURCE)
  const { options: moduleOptions, load: loadModuleOptions } = useEnumOptions(DICT_MODULE)
  const { options: moduleEntityOptions, load: loadModuleEntityOptions } = useEnumOptions(DICT_MODULE_ENTITY)
  const { options: operateTypeOptions, load: loadOperateTypeOptions } = useEnumOptions(DICT_ACTION_TYPE)
  const { options: actionStatusOptions, load: loadActionStatusOptions } = useEnumOptions(DICT_ACTION_STATUS)

  const state = reactive({
    loading: false,
    showSearchCard: true,
    detailVisible: false,
    operatorDialogVisible: false,

    // 操作人相关状态
    selectedOperators: [] as BIamUserSimpleListResponseVo[],

    tableData: [] as BIamOperationLogExpandListResponseVo[],
    selectedLogId: '',
    searchForm: {
      userIdSet: [] as string[],
      phone: null as string | null,
      realName: null as string | null,
      operateName: null as string | null,
      operateSource: null as string | null,
      module: null as string | null,
      moduleEntity: null as string | null,
      moduleEntityId: null as string | null,
      operateType: null as string | null,
      actionStatus: null as string | null,
      httpStatus: null as number | null,
      requestPath: null as string | null,
      clientIp: null as string | null,
      traceId: null as string | null,
      timeRange: null as number[] | null
    },
    pagination: {
      current: 1,
      size: 20,
      total: 0
    }
  })

  const searchFormRef = ref<FormInstance>()
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

  // 计算属性 - 操作人ID集合
  const selectedOperatorIds = computed({
    get: () => state.selectedOperators.map(u => u.id),
    set: newIds => {
      state.selectedOperators = newIds.map(id => state.selectedOperators.find(user => user.id === id) || ({ id } as BIamUserSimpleListResponseVo))
    }
  })

  const fetchData = async (): Promise<void> => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const res: BIamOperationLogExpandPageResponse = await BIamOperationLogApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取操作日志失败:', error)
    } finally {
      state.loading = false
    }
  }

  const buildQueryParams = (): BIamOperationLogQueryPageRequestVo => {
    return {
      current: state.pagination.current,
      size: state.pagination.size,
      ...(state.searchForm.phone && { phone: state.searchForm.phone }),
      ...(state.searchForm.realName && { realName: state.searchForm.realName }),
      ...(state.searchForm.operateName && { operateName: state.searchForm.operateName }),
      ...(state.searchForm.operateSource && { operateSource: state.searchForm.operateSource }),
      ...(state.searchForm.module && { module: state.searchForm.module }),
      ...(state.searchForm.moduleEntity && { moduleEntity: state.searchForm.moduleEntity }),
      ...(state.searchForm.moduleEntityId && { moduleEntityId: state.searchForm.moduleEntityId }),
      ...(state.searchForm.operateType && { operateType: state.searchForm.operateType }),
      ...(state.searchForm.actionStatus && { actionStatus: state.searchForm.actionStatus }),
      ...(state.searchForm.httpStatus != null && { httpStatus: state.searchForm.httpStatus }),
      ...(state.searchForm.requestPath && { requestPath: state.searchForm.requestPath }),
      ...(state.searchForm.clientIp && { clientIp: state.searchForm.clientIp }),
      ...(state.searchForm.traceId && { traceId: state.searchForm.traceId }),
      ...(state.searchForm.timeRange?.length === 2 && {
        createStartTime: state.searchForm.timeRange[0],
        createEndTime: state.searchForm.timeRange[1]
      }),
      // 操作人查询条件
      ...(state.selectedOperators.length > 0 && { userIdSet: state.selectedOperators.map(u => u.id) })
    }
  }

  const handleSearch = (): void => {
    state.pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const handleResetSearch = (): void => {
    searchFormRef.value?.resetFields()
    state.searchForm.timeRange = null
    state.selectedOperators = [] // 重置操作人选择
    handleSearch()
  }

  const handlePageChange = (): void => {
    void fetchData()
  }

  const handleSizeChange = (newSize: number): void => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const showDetail = (row: BIamOperationLogExpandListResponseVo): void => {
    state.selectedLogId = row.id
    state.detailVisible = true
  }

  // 操作人相关方法
  const showOperatorSelectorDialog = () => {
    state.operatorDialogVisible = true
  }

  const clearSelectorAllOperators = () => {
    state.selectedOperators = []
  }

  const removeQueryOperator = (userId: string) => {
    state.selectedOperators = state.selectedOperators.filter(user => user.id !== userId)
  }

  const handleOperatorSelect = (users: BIamUserSimpleListResponseVo[]) => {
    state.selectedOperators = users
    state.operatorDialogVisible = false
  }

  const formatTime = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  onMounted(async () => {
    await loadOperateSourceOptions()
    await loadModuleOptions()
    await loadModuleEntityOptions()
    await loadOperateTypeOptions()
    await loadActionStatusOptions()
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

  .operation-log-page {
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

          // 操作时间字段特殊宽度
          &.form-item-date-picker {
            flex: 1 1 440px;
            max-width: 440px;

            :deep(.el-date-editor) {
              width: 100%;
              max-width: 440px;
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
      justify-content: flex-end;
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

  .text-ellipsis {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .http-status-error {
    color: var(--el-color-danger);
    font-weight: 600;
  }
</style>
