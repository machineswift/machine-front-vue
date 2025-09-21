<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="下载任务详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="20vh"
  >
    <el-descriptions :column="2" border v-loading="state.loading">
      <el-descriptions-item label="任务ID">
        {{ state.detailData.id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getDownloadStatusTagType(state.detailData.status)">
          {{ getStatusText(state.detailData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="文件名称">
        {{ state.detailData.attachment?.name || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="文件大小">
        {{ formatFileSize(state.detailData.attachment?.size || 0) }}
      </el-descriptions-item>
      <el-descriptions-item label="文件类型">
        {{ state.detailData.attachment?.type || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="失败原因" span="2" v-if="state.detailData.failCause">
        {{ state.detailData.failCause }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ state.detailData.createName || state.detailData.createBy || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新人">
        {{ state.detailData.updateName || state.detailData.updateBy || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatTime(state.detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatTime(state.detailData.updateTime) }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataDownloadApi } from '@/modules/data/download/api/DataDownload.api'
  import type { QueryDownloadDetailResponseVo } from '@/modules/data/download/type/DataDownload.type'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    downloadId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'close', 'success'])

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    retrying: false,
    detailData: {
      id: '',
      status: null as string | null,
      attachment: {
        id: '',
        name: '',
        size: 0,
        type: null as string | null
      },
      failCause: '',
      createName: '',
      createBy: '',
      createTime: 0,
      updateName: '',
      updateBy: '',
      updateTime: 0
    } as QueryDownloadDetailResponseVo
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  // 获取状态文本
  const getStatusText = (status: string) => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataDownloadStatusEnum', status)
    return enumItem?.message || status
  }

  // 获取详情
  const fetchDetail = async () => {
    try {
      state.loading = true
      const response = await DataDownloadApi.detail({ id: props.downloadId })
      state.detailData = response || {}
    } catch (error) {
      console.error('获取下载任务详情失败', error)
      ElMessage.error('获取详情失败')
      state.detailData = {} as QueryDownloadDetailResponseVo
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    // 重置详情数据
    state.detailData = {
      id: '',
      status: null as string | null,
      attachment: {
        id: '',
        name: '',
        size: 0,
        type: null as string | null
      },
      failCause: '',
      createName: '',
      createBy: '',
      createTime: 0,
      updateName: '',
      updateBy: '',
      updateTime: 0
    }

    // 重置加载状态
    state.loading = false
    state.retrying = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.downloadId],
    async ([modelValue, downloadId]) => {
      if (modelValue && downloadId) {
        await fetchDetail()
      }
    },
    { immediate: false }
  )
</script>
