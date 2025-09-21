<template>
  <div>
    <transition name="slide-fade">
      <el-card class="search-card" v-show="state.showSearchCard">
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

            <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive">
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
      <div class="operation-buttons">
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <el-table :data="state.tableData" border v-loading="state.loading" :height="state.dataCardHeight" style="margin: 10px 0" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" align="center" v-if="false" />
        <el-table-column label="序号" align="center" type="index" width="60" fixed />

        <el-table-column prop="attachment.name" label="文件名称" align="center" width="240">
          <template #default="{ row }">
            {{ row.attachment?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="attachment.fileSize" label="文件大小" align="center" width="80">
          <template #default="{ row }">
            {{ row.attachment ? formatFileSize(row.attachment.size) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="attachment.type" label="文件类型" align="center" width="120">
          <template #default="{ row }">
            {{ row.attachment ? getAttachmentTypeLabel(row.attachment.type) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getDownloadStatusTagType(row.status)">
              {{ getDownloadStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="failCause" label="失败原因" align="center" width="240">
          <template #default="{ row }">
            {{ row.failCause || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createBy" label="创建人" align="center" width="120" />
        <el-table-column prop="createTime" label="创建时间" align="center" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateBy" label="更新人" align="center" width="120" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="180">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
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
            <el-button size="small" type="success" @click="handleDownload(row)" v-if="row.status === 'FINISH' && row.attachment">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
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
  import { ref, reactive, onMounted, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { DataDownloadApi } from '@/modules/data/download/api/DataDownload.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataDownloadListResponseVo } from '@/modules/data/download/type/DataDownload.type'
  import DataDownloadDetailDialog from '@/modules/data/download/DataDownloadDetailDialog.vue'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentDownloadId: '',
    dataCardHeight: 'calc(100vh - 300px)',
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

  // 监听搜索框展开状态，调整表格高度
  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.dataCardHeight = newVal ? 'calc(100vh - 400px)' : 'calc(100vh - 200px)'
      }, 80)
    },
    { immediate: false }
  )

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
      ElMessage.error('获取下载列表失败')
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
      await ElMessageBox.confirm(`确定要重试下载任务 "${row.attachment.fileName}" 吗?`, '提示', {
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
    const urlResponse = await DataAttachmentApi.getUrl(row.attachment.id)
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

  const getAttachmentTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataAttachmentTypeEnum', type)
    return enumItem?.message || type
  }

  const getDownloadStatusLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataDownloadStatusEnum', type)
    return enumItem?.message || type
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
    await enumStore.getEnumDataAsync('DataAttachmentTypeEnum')
    state.downloadStatus = await enumStore.getEnumDataAsync('DataDownloadStatusEnum')
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
        flex: 1 1 320px;
        min-width: 120px;
        max-width: 320px;
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
