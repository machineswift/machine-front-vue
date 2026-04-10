<template>
  <el-dialog v-model="visible" title="素材详情" width="620px" :close-on-click-modal="false">
    <el-descriptions :column="1" border v-loading="loading">
      <el-descriptions-item label="ID">{{ detailData.id || '无' }}</el-descriptions-item>
      <el-descriptions-item label="文件类型">
        <el-tag size="small">{{ getFileTypeLabel(detailData.fileType) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="素材标题">{{ detailData.title || '无' }}</el-descriptions-item>
      <el-descriptions-item label="附件">
        <template v-if="detailData.attachmentId">
          <template v-if="detailData.fileType === 'IMAGE' && attachmentUrl">
            <el-image
              :src="attachmentUrl"
              fit="contain"
              class="detail-preview-image material-preview-image"
              :preview-src-list="[attachmentUrl]"
              preview-teleported
              hide-on-click-modal
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
            />
          </template>
          <template v-else-if="attachmentUrl">
            <a :href="attachmentUrl" target="_blank" rel="noopener" class="detail-download-link">查看 / 下载附件</a>
          </template>
          <span v-else class="attachment-loading">加载中…</span>
        </template>
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="处理状态">{{ getProcessStatusLabel(detailData.processStatus) }}</el-descriptions-item>
      <el-descriptions-item label="业务状态">{{ getBusinessStatusLabel(detailData.businessStatus) }}</el-descriptions-item>
      <el-descriptions-item label="审核状态">{{ getAuditStatusLabel(detailData.auditStatus) }}</el-descriptions-item>
      <el-descriptions-item label="分类">
        <template v-if="detailData.categoryIdSet && detailData.categoryIdSet.length">
          <el-tag v-for="cid in detailData.categoryIdSet" :key="cid" size="small" style="margin-right: 4px; margin-bottom: 4px">
            {{ getCategoryName(cid) }}
          </el-tag>
        </template>
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">{{ detailData.createName || '无' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatTimestamp(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="修改人">{{ detailData.updateName || '无' }}</el-descriptions-item>
      <el-descriptions-item label="修改时间">{{ formatTimestamp(detailData.updateTime) }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { DataMaterialDetailResponseVo } from '@/modules/data/material/type/DataMaterial.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    materialId: { type: String, default: '' },
    categoryNameMap: { type: Object as () => Record<string, string>, default: () => ({}) }
  })

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()
  const visible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })
  const loading = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({})
  const attachmentUrl = ref('')

  const getCategoryName = (categoryId: string): string => {
    return (props.categoryNameMap && props.categoryNameMap[categoryId]) || categoryId
  }

  const getFileTypeLabel = (code?: string) => (code ? enumStore.getEnumItemByCodeSync('DataFileTypeEnum', code)?.message || code : '无')
  const getProcessStatusLabel = (code?: string) => (code ? enumStore.getEnumItemByCodeSync('DataMaterialProcessStatusEnum', code)?.message || code : '无')
  const getBusinessStatusLabel = (code?: string) => (code ? enumStore.getEnumItemByCodeSync('DataMaterialBusinessStatusEnum', code)?.message || code : '无')
  const getAuditStatusLabel = (code?: string) => (code ? enumStore.getEnumItemByCodeSync('DataMaterialAuditStatusEnum', code)?.message || code : '无')
  const formatTimestamp = (timestamp?: number) => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const loadAttachmentUrl = async (attachmentId: string) => {
    if (!attachmentId) {
      attachmentUrl.value = ''
      return
    }
    try {
      const res = await DataAttachmentApi.getUrl(attachmentId)
      attachmentUrl.value = res?.url || ''
    } catch {
      attachmentUrl.value = ''
    }
  }

  const fetchDetail = async () => {
    if (!props.materialId) return
    try {
      loading.value = true
      const res = await DataMaterialApi.detail({ id: props.materialId })
      detailData.value = res || {}
      if (res?.attachmentId) {
        await loadAttachmentUrl(res.attachmentId)
      } else {
        attachmentUrl.value = ''
      }
    } catch (error) {
      console.error('获取素材详情失败', error)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.modelValue,
    val => {
      if (val && props.materialId) fetchDetail()
      else attachmentUrl.value = ''
    },
    { immediate: false }
  )
</script>

<style scoped>
  .detail-preview-image {
    max-width: 280px;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
  }
  .detail-download-link {
    color: var(--el-color-primary);
  }
  .attachment-loading {
    color: var(--el-text-color-secondary);
  }
</style>
