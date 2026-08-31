<template>
  <div ref="pageContainerRef" class="download-page">
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="search-card" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="文件名称:" prop="fileName" class="form-item-responsive">
              <el-input v-model="state.searchForm.fileName" placeholder="文件名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="statusList" class="form-item-responsive">
              <el-select v-model="state.searchForm.statusList" multiple clearable collapse-tags collapse-tags-tooltip placeholder="选择状态">
                <el-option v-for="option in downloadStatus" :key="option.code" :label="option.message" :value="option.code" />
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
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:DOWNLOAD:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:DOWNLOAD:PAGE_EXPAND']">
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
    <el-card ref="dataCardRef" class="data-card">
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table :data="state.tableData" border v-loading="state.loading" :height="tableHeight" style="margin: 10px 0" stripe highlight-current-row>
          <el-table-column prop="id" label="ID" align="center" v-if="false" />
          <el-table-column label="序号" align="center" type="index" width="60" fixed />

          <el-table-column prop="module" label="模块" align="center" width="100">
            <template #default="{ row }">
              {{ row.module ? enumStore.getEnumLabel(DICT_MODULE, row.module) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="entity" label="实体" align="center" width="120">
            <template #default="{ row }">
              {{ row.entity ? enumStore.getEnumLabel(DICT_MODULE_ENTITY, row.entity) : '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="attachmentOriginalName" label="文件名称" align="center" width="240">
            <template #default="{ row }">
              <el-tooltip v-if="row.attachmentOriginalName" :content="row.attachmentOriginalName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.attachmentOriginalName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="fileType" label="文件类型" align="center" width="120">
            <template #default="{ row }">
              {{ row.fileType ? enumStore.getEnumLabel(DICT_DATA_FILE_TYPE, row.fileType) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" align="center" width="120">
            <template #default="{ row }">
              <el-tag :type="getDownloadStatusTagType(row.status)">
                {{ enumStore.getEnumLabel(DICT_DATA_DOWNLOAD_STATUS, row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="attachmentSize" label="文件大小" align="center" width="120">
            <template #default="{ row }">
              {{ row.attachmentSize != null ? formatFileSize(row.attachmentSize) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="expireTime" label="过期时间" align="center" width="220">
            <template #default="{ row }">
              <el-tag v-if="row.expireTime && isExpired(row.expireTime)" type="warning">已过期</el-tag>
              <span v-if="row.expireTime">{{ formatTime(row.expireTime) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="failCause" label="失败原因" align="center" width="240">
            <template #default="{ row }">
              <el-tooltip v-if="row.failCause" :content="row.failCause" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.failCause }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="createName" label="创建人" align="center" width="120">
            <template #default="{ row }">{{ row.createName || row.createBy || '-' }}</template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="更新人" align="center" width="120">
            <template #default="{ row }">{{ row.updateName || row.updateBy || '-' }}</template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" v-hasPermission="['MANAGE_APP:SYSTEM:DATA:DOWNLOAD:DETAIL']" @click="showDetail(row)">详情</el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleRetry(row)"
                  v-if="row.status === 'FAIL' || row.status === 'DEAD'"
                  v-hasPermission="['MANAGE_APP:SYSTEM:DATA:DOWNLOAD:RETRY']"
                >
                  重试
                </el-button>
                <el-tooltip v-if="row.status === 'FINISH' && row.attachmentId && isExpired(row.expireTime)" content="文件已过期，无法下载" placement="top">
                  <el-button size="small" type="success" disabled>下载</el-button>
                </el-tooltip>
                <el-button
                  size="small"
                  type="success"
                  @click="handleDownload(row)"
                  v-else-if="row.status === 'FINISH' && row.attachmentId"
                  v-hasPermission="['MANAGE_APP:SYSTEM:DATA:DOWNLOAD:DOWNLOAD_FILE']"
                >
                  下载
                </el-button>
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

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <DataDownloadDetailDialog v-model="state.dialog.detail" :download-id="state.currentDownloadId" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:WORKSPACE:DOWNLOAD'
  })
  import { ref, reactive, onMounted, onActivated, watch, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_DATA_FILE_TYPE, DICT_DATA_DOWNLOAD_STATUS, DICT_MODULE, DICT_MODULE_ENTITY } from '@/shared/constants/DictionaryEnum.constant'
  import { DataDownloadApi } from '@/modules/data/download/api/DataDownload.api'
  import type { DataDownloadListResponseVo } from '@/modules/data/download/type/DataDownload.type'
  import DataDownloadDetailDialog from '@/modules/data/download/DataDownloadDetailDialog.vue'

  const enumStore = useDictionaryEnumStore()

  const { options: downloadStatus, load: loadDownloadStatus } = useEnumOptions(DICT_DATA_DOWNLOAD_STATUS)

  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentDownloadId: '',
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },
    searchForm: {
      fileName: '',
      statusList: [] as string[],
      createTimeRange: [] as number[]
    },
    dialog: {
      detail: false
    },
    tableData: [] as DataDownloadListResponseVo[]
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

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

  const fetchDownloadList = async () => {
    try {
      state.loading = true
      const params = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.fileName && { fileName: state.searchForm.fileName }),
        ...(state.searchForm.statusList.length > 0 && { statusList: state.searchForm.statusList }),
        ...(state.searchForm.createTimeRange?.[0] && { createStartTime: state.searchForm.createTimeRange[0] }),
        ...(state.searchForm.createTimeRange?.[1] && { createEndTime: state.searchForm.createTimeRange[1] })
      }

      const res = await DataDownloadApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取下载列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchDownloadList()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.createTimeRange = []
    state.searchForm.statusList = []
    handleSearch()
  }

  const handlePageChange = () => fetchDownloadList()
  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchDownloadList()
  }

  const showDetail = (row: { id: string }) => {
    state.currentDownloadId = row.id
    state.dialog.detail = true
  }

  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    state.searchForm.createTimeRange = value ?? []
  }

  const handleRetry = async (row: DataDownloadListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要重试下载任务 "${row.attachmentOriginalName || row.id}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DataDownloadApi.retry({ id: row.id })
      ElMessage.success('重试任务已提交')
      // 刷新列表
      await fetchDownloadList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('重试下载任务失败:', error)
        ElMessage.error('重试下载任务失败')
      }
    }
  }

  const handleDownload = async (row: DataDownloadListResponseVo) => {
    try {
      await DataDownloadApi.downloadFile({ id: row.id }, row.attachmentOriginalName || 'download')
    } catch (error) {
      console.error('下载文件失败:', error)
      ElMessage.error('下载文件失败')
    }
  }

  // 获取状态标签类型
  const DOWNLOAD_STATUS_TAG_MAP: Record<string, string> = {
    FINISH: 'success',
    FAIL: 'danger',
    DEAD: 'danger'
  }
  const getDownloadStatusTagType = (status: string): string => {
    return DOWNLOAD_STATUS_TAG_MAP[status] || 'info'
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const isExpired = (expireTime?: number) => {
    if (!expireTime) return false
    return Date.now() > expireTime
  }

  const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
  const FILE_SIZE_BASE = 1024
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_BASE))
    return parseFloat((bytes / Math.pow(FILE_SIZE_BASE, i)).toFixed(2)) + ' ' + FILE_SIZE_UNITS[i]
  }

  onMounted(async () => {
    await Promise.all([
      enumStore.getEnumDataAsync(DICT_DATA_FILE_TYPE),
      enumStore.getEnumDataAsync(DICT_DATA_DOWNLOAD_STATUS),
      enumStore.getEnumDataAsync(DICT_MODULE),
      enumStore.getEnumDataAsync(DICT_MODULE_ENTITY)
    ])
    await loadDownloadStatus()
    await fetchDownloadList()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await Promise.all([
      enumStore.getEnumDataAsync(DICT_DATA_FILE_TYPE),
      enumStore.getEnumDataAsync(DICT_DATA_DOWNLOAD_STATUS),
      enumStore.getEnumDataAsync(DICT_MODULE),
      enumStore.getEnumDataAsync(DICT_MODULE_ENTITY)
    ])
    await fetchDownloadList()
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

  .download-page {
    height: 100%;
    min-height: 0;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  .search-card {
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

        // 日期选择器宽度限制
        :deep(.el-date-editor) {
          width: 100%;
          max-width: 280px;
        }

        // 创建时间字段特殊宽度
        &.form-item-date-picker {
          flex: 1 1 320px;
          max-width: 320px;

          :deep(.el-date-editor) {
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

  .data-card {
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
