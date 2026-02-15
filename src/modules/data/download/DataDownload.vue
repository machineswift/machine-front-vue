<template>
  <div>
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="search-card" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="文件名称:" prop="fileName" class="form-item-responsive">
              <el-input v-model="state.searchForm.fileName" placeholder="文件名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="statusList" class="form-item-responsive">
              <el-select v-model="state.searchForm.statusList" multiple clearable collapse-tags collapse-tags-tooltip placeholder="选择状态">
                <el-option v-for="option in state.downloadStatus" :key="option.code" :label="option.message" :value="option.code" />
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
              <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:DATA:DOWNLOAD:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['SYSTEM:DATA:DOWNLOAD:PAGE_EXPAND']">
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
    <el-card class="data-card">
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <el-table :data="state.tableData" border v-loading="state.loading" :height="tableHeight" style="margin: 10px 0" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" align="center" v-if="false" />
        <el-table-column label="序号" align="center" type="index" width="60" fixed />

        <el-table-column prop="module" label="模块" align="center" width="100">
          <template #default="{ row }">
            {{ getModuleLabel(row.module) }}
          </template>
        </el-table-column>
        <el-table-column prop="entity" label="实体" align="center" width="120">
          <template #default="{ row }">
            {{ getEntityLabel(row.entity) }}
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
            {{ row.fileType ? getFileTypeLabel(row.fileType) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getDownloadStatusTagType(row.status)">
              {{ getDownloadStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="attachmentSize" label="文件大小" align="center" width="120">
          <template #default="{ row }">
            {{ row.attachmentSize != null ? formatFileSize(row.attachmentSize) : '-' }}
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
              <el-button size="small" v-hasPermission="['SYSTEM:DATA:DOWNLOAD:DETAIL']" @click="showDetail(row)">详情</el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleRetry(row)"
                v-if="row.status === 'FAIL' || row.status === 'DEAD'"
                v-hasPermission="['SYSTEM:DATA:DOWNLOAD:RETRY']"
              >
                重试
              </el-button>
              <el-button size="small" type="success" @click="handleDownload(row)" v-if="row.status === 'FINISH' && row.attachmentId">下载</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        ref="paginationRef"
        v-model:current-page="state.pagination.current"
        v-model:page-size="state.pagination.size"
        :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="state.pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 详情对话框 -->
    <DataDownloadDetailDialog v-model="state.dialog.detail" :download-id="state.currentDownloadId" />
  </div>
</template>

<script setup lang="ts">
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:WORKSPACE:DOWNLOAD'
  })
  import { ref, reactive, onMounted, watch, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { useWindowSize } from '@vueuse/core'
  import { DataDownloadApi } from '@/modules/data/download/api/DataDownload.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataDownloadListResponseVo } from '@/modules/data/download/type/DataDownload.type'
  import { DATA_FILE_TYPE_LABEL_MAP } from '@/modules/data/download/type/DataDownload.type'
  import DataDownloadDetailDialog from '@/modules/data/download/DataDownloadDetailDialog.vue'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentDownloadId: '',
    downloadStatus: [],
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    searchForm: {
      fileName: '',
      statusList: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    dialog: {
      detail: false
    },
    tableData: [] as DataDownloadListResponseVo[]
  })

  const searchFormRef = ref()
  const searchCardRef = ref<HTMLElement | null>(null)
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  // 表格高度计算
  const { height: windowHeight } = useWindowSize()
  const tableHeight = ref<number>(600)

  const calculateTableHeight = async () => {
    await nextTick()
    if (!windowHeight.value) return

    const searchCardHeight = state.showSearchCard && searchCardRef.value ? searchCardRef.value.offsetHeight : 0
    const searchCardSpacing = searchCardHeight > 0 ? 8 : 0
    const operationButtonsHeight = operationButtonsRef.value?.offsetHeight || 50
    const paginationHeight = paginationRef.value?.offsetHeight || 60
    const paginationSpacing = paginationHeight > 0 ? 8 : 0
    // 顶部导航90px + 页面边距20px(上下各10px) + 卡片边距20px(上下各10px)
    const reservedHeight = 90 + 20 + 20 + searchCardHeight + searchCardSpacing + operationButtonsHeight + paginationHeight + paginationSpacing
    const availableHeight = windowHeight.value - reservedHeight
    // 最小高度设为400px，确保在小屏幕上也有良好的显示效果
    tableHeight.value = Math.max(400, availableHeight)
  }

  watch([windowHeight, () => state.showSearchCard, searchCardRef, operationButtonsRef, paginationRef], calculateTableHeight, { immediate: true })

  // 方法
  const fetchDownloadList = async () => {
    try {
      state.loading = true
      const params = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.fileName && { fileName: state.searchForm.fileName }),
        ...(state.searchForm.statusList.length > 0 && { statusList: state.searchForm.statusList }),
        ...(state.searchForm.createStartTime && { createStartTime: state.searchForm.createStartTime }),
        ...(state.searchForm.createEndTime && { createEndTime: state.searchForm.createEndTime })
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
    state.searchForm.createStartTime = undefined
    state.searchForm.createEndTime = undefined
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
    if (value?.length === 2) {
      state.searchForm.createStartTime = value[0]
      state.searchForm.createEndTime = value[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
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
    if (!row.attachmentId) return
    const urlResponse = await DataAttachmentApi.getUrl(row.attachmentId)
    if (urlResponse.url) {
      window.open(urlResponse.url, '_blank')
    } else {
      ElMessage.warning('文件下载链接不存在')
    }
  }

  // 获取状态标签类型
  const getDownloadStatusTagType = (status: string): string => {
    switch (status) {
      case 'FINISH':
        return 'success'
      case 'FAIL':
      case 'DEAD':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getFileTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataFileTypeEnum', type)
    return enumItem?.message ?? DATA_FILE_TYPE_LABEL_MAP[type] ?? type
  }

  const getDownloadStatusLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataDownloadStatusEnum', type)
    return enumItem?.message || type
  }

  const getModuleLabel = (code?: string): string => {
    if (!code) return '-'
    const enumItem = enumStore.getEnumItemByCodeSync('ModuleEnum', code)
    return enumItem?.message ?? code
  }

  const getEntityLabel = (code?: string): string => {
    if (!code) return '-'
    const enumItem = enumStore.getEnumItemByCodeSync('ModuleEntityEnum', code)
    return enumItem?.message ?? code
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 初始化
  onMounted(async () => {
    await Promise.all([
      enumStore.getEnumDataAsync('DataFileTypeEnum'),
      enumStore.getEnumDataAsync('DataDownloadStatusEnum'),
      enumStore.getEnumDataAsync('ModuleEnum'),
      enumStore.getEnumDataAsync('ModuleEntityEnum')
    ])
    state.downloadStatus = enumStore.getEnumDataSync('DataDownloadStatusEnum')
    await fetchDownloadList()
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

  .search-card,
  .data-card {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    margin: 4px;
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
    }
  }

  .data-card {
    .operation-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 12px;

      .el-switch {
        margin-left: 8px;
      }
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
