<template>
  <div ref="pageContainerRef" class="attachment-log-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="90px">
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
              <el-input v-model="state.searchForm.phone" placeholder="请输入手机号" clearable />
            </el-form-item>
            <el-form-item label="姓名:" prop="realName" class="form-item-responsive">
              <el-input v-model="state.searchForm.realName" placeholder="请输入姓名" clearable />
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
            <el-form-item label="业务实体:" prop="moduleEntity" class="form-item-responsive">
              <el-select v-model="state.searchForm.moduleEntity" placeholder="选择业务实体" clearable>
                <el-option v-for="option in moduleEntityOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务实体ID:" prop="moduleEntityId" class="form-item-responsive">
              <el-input v-model="state.searchForm.moduleEntityId" placeholder="请输入业务实体ID" clearable />
            </el-form-item>
            <el-form-item label="附件分组:" prop="attachmentGroup" class="form-item-responsive">
              <el-input v-model="state.searchForm.attachmentGroup" placeholder="请输入附件分组" clearable />
            </el-form-item>
            <el-form-item label="操作类型:" prop="operationTypeSet" class="form-item-responsive">
              <el-select v-model="state.searchForm.operationTypeSet" placeholder="选择操作类型" multiple collapse-tags collapse-tags-tooltip clearable>
                <el-option v-for="option in operationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作结果:" prop="operationResult" class="form-item-responsive">
              <el-select v-model="state.searchForm.operationResult" placeholder="选择操作结果" clearable>
                <el-option v-for="option in operationResultOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="链路追踪:" prop="traceId" class="form-item-responsive">
              <el-input v-model="state.searchForm.traceId" placeholder="请输入链路追踪ID" clearable />
            </el-form-item>
            <el-form-item label="客户端IP:" prop="clientIp" class="form-item-responsive">
              <el-input v-model="state.searchForm.clientIp" placeholder="请输入客户端IP" clearable />
            </el-form-item>
            <el-form-item label="平台:" prop="platform" class="form-item-responsive">
              <el-input v-model="state.searchForm.platform" placeholder="请输入平台" clearable />
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
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:ATTACHMENT_LOG:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleResetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:ATTACHMENT_LOG:PAGE_EXPAND']">
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
          <el-table-column prop="attachmentId" label="附件ID" align="center" width="280" v-if="false">
            <template #default="{ row }">
              <el-tooltip v-if="row.attachmentId" :content="row.attachmentId" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.attachmentId }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="versionId" label="版本ID" align="center" width="280" v-if="false">
            <template #default="{ row }">
              <el-tooltip v-if="row.versionId" :content="row.versionId" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.versionId }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="operateSource" label="操作来源" align="center" width="120">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_OPERATE_SOURCE, row.operateSource) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="操作模块" align="center" width="120">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_MODULE, row.module) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="moduleEntity" label="业务实体" align="center" width="140">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_MODULE_ENTITY, row.moduleEntity) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="moduleEntityId" label="业务实体ID" align="center" width="320" v-if="false">
            <template #default="{ row }">
              <el-tooltip v-if="row.moduleEntityId" :content="row.moduleEntityId" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.moduleEntityId }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="moduleEntityName" label="业务实体名称" align="center" width="320">
            <template #default="{ row }">
              <el-tooltip v-if="row.moduleEntityName" :content="row.moduleEntityName" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.moduleEntityName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="attachmentGroup" label="附件分组" align="center" width="150" />
          <el-table-column prop="operationType" label="操作类型" align="center" width="110">
            <template #default="{ row }">
              <el-tag>{{ enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_TYPE, row.operationType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operationResult" label="操作结果" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="operationResultTagType(row.operationResult)">
                {{ enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_RESULT, row.operationResult) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="clientIp" label="客户端IP" align="center" width="130" />
          <el-table-column prop="platform" label="平台" align="center" width="140" />
          <el-table-column prop="createName" label="操作人" align="center" width="110" v-if="false" />
          <el-table-column prop="createTime" label="操作时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="100" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="showDetail(row)" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:ATTACHMENT_LOG:DETAIL']">详情</el-button>
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
          v-hasPermission="['MANAGE_APP:SYSTEM:DATA:ATTACHMENT_LOG:PAGE_EXPAND']"
        />
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <DataAttachmentLogDetail v-model="state.detailVisible" :log-id="state.selectedLogId" />

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
    name: 'MANAGE_APP:SYSTEM:LOG_CENTER:ATTACHMENT_LOG'
  })
  import { onMounted, onActivated, reactive, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import DataAttachmentLogDetail from '@/modules/data/attachment/DataAttachmentLogDetail.vue'
  import { DataAttachmentLogApi } from '@/modules/data/attachment/api/DataAttachmentLog.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import {
    DICT_MODULE,
    DICT_MODULE_ENTITY,
    DICT_OPERATE_SOURCE,
    DICT_DATA_ATTACHMENT_OPERATION_TYPE,
    DICT_DATA_ATTACHMENT_OPERATION_RESULT
  } from '@/shared/constants/DictionaryEnum.constant'
  import type {
    DataAttachmentLogExpandListResponseVo,
    DataAttachmentLogExpandPageResponse,
    DataAttachmentLogQueryPageRequestVo
  } from '@/modules/data/attachment/type/DataAttachment.type'
  import BIamUserQuickSelectDialog from '@/modules/biam/user/BIamUserQuickSelectDialog.vue'
  import type { BIamUserSimpleListResponseVo } from '@/modules/biam/user/type/BIamUser.type'

  const enumStore = useDictionaryEnumStore()

  const { options: operateSourceOptions, load: loadOperateSourceOptions } = useEnumOptions(DICT_OPERATE_SOURCE)
  const { options: moduleOptions, load: loadModuleOptions } = useEnumOptions(DICT_MODULE)
  const { options: moduleEntityOptions, load: loadModuleEntityOptions } = useEnumOptions(DICT_MODULE_ENTITY)
  const { options: operationTypeOptions, load: loadOperationTypeOptions } = useEnumOptions(DICT_DATA_ATTACHMENT_OPERATION_TYPE)
  const { options: operationResultOptions, load: loadOperationResultOptions } = useEnumOptions(DICT_DATA_ATTACHMENT_OPERATION_RESULT)

  const state = reactive({
    loading: false,
    showSearchCard: true,
    detailVisible: false,
    operatorDialogVisible: false,

    // 操作人相关状态
    selectedOperators: [] as BIamUserSimpleListResponseVo[],

    tableData: [] as DataAttachmentLogExpandListResponseVo[],
    selectedLogId: '',
    searchForm: {
      userIdSet: [] as string[],
      phone: null as string | null,
      realName: null as string | null,
      operateSource: null as string | null,
      module: null as string | null,
      moduleEntity: null as string | null,
      moduleEntityId: null as string | null,
      attachmentGroup: null as string | null,
      operationTypeSet: null as string[] | null,
      operationResult: null as string | null,
      clientIp: null as string | null,
      traceId: null as string | null,
      platform: null as string | null,
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
      const res: DataAttachmentLogExpandPageResponse = await DataAttachmentLogApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取附件操作日志失败:', error)
    } finally {
      state.loading = false
    }
  }

  const buildQueryParams = (): DataAttachmentLogQueryPageRequestVo => {
    return {
      current: state.pagination.current,
      size: state.pagination.size,
      ...(state.searchForm.operateSource && { operateSource: state.searchForm.operateSource }),
      ...(state.searchForm.module && { module: state.searchForm.module }),
      ...(state.searchForm.moduleEntity && { moduleEntity: state.searchForm.moduleEntity }),
      ...(state.searchForm.moduleEntityId && { moduleEntityId: state.searchForm.moduleEntityId }),
      ...(state.searchForm.attachmentGroup && { attachmentGroup: state.searchForm.attachmentGroup }),
      ...(state.searchForm.operationTypeSet?.length ? { operationTypeSet: state.searchForm.operationTypeSet } : {}),
      ...(state.searchForm.operationResult && { operationResult: state.searchForm.operationResult }),
      ...(state.searchForm.clientIp && { clientIp: state.searchForm.clientIp }),
      ...(state.searchForm.traceId && { traceId: state.searchForm.traceId }),
      ...(state.searchForm.platform && { platform: state.searchForm.platform }),
      ...(state.searchForm.timeRange?.length === 2 && {
        createStartTime: state.searchForm.timeRange[0],
        createEndTime: state.searchForm.timeRange[1]
      }),
      // 操作主体查询条件
      ...(state.selectedOperators.length > 0 && { userIdSet: state.selectedOperators.map(u => u.id) }),
      ...(state.searchForm.phone && { phone: state.searchForm.phone }),
      ...(state.searchForm.realName && { realName: state.searchForm.realName })
    }
  }

  const handleSearch = (): void => {
    state.pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const handleResetSearch = (): void => {
    searchFormRef.value?.resetFields()
    state.searchForm.operationTypeSet = null
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

  const showDetail = (row: DataAttachmentLogExpandListResponseVo): void => {
    state.selectedLogId = row.id
    state.detailVisible = true
  }

  const operationResultTagType = (result?: string): 'success' | 'danger' | 'warning' | 'info' => {
    if (result === 'SUCCESS') return 'success'
    if (result === 'FAILURE') return 'danger'
    if (result === 'PARTIAL') return 'warning'
    return 'info'
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
    await loadOperationTypeOptions()
    await loadOperationResultOptions()
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

  .attachment-log-page {
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

      .el-button {
        margin-right: 8px;
      }

      .el-switch {
        margin-left: auto;
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
</style>
