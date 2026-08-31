<template>
  <el-dialog
    v-model="visible"
    title="素材详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="5vh"
  >
    <el-form :model="detailData" label-width="100px" v-loading="loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="素材标题">
            <el-input :model-value="detailData.title || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件类型">
            <el-tag size="small">{{ detailData.fileType ? enumStore.getEnumLabel(DICT_DATA_FILE_TYPE, detailData.fileType) : '无' }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="处理状态">
            <el-input
              :model-value="detailData.processStatus ? enumStore.getEnumLabel(DICT_DATA_MATERIAL_PROCESS_STATUS, detailData.processStatus) : '无'"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务状态">
            <el-input
              :model-value="detailData.businessStatus ? enumStore.getEnumLabel(DICT_DATA_MATERIAL_BUSINESS_STATUS, detailData.businessStatus) : '无'"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="审核状态">
            <el-input :model-value="detailData.auditStatus ? enumStore.getEnumLabel(DICT_DATA_MATERIAL_AUDIT_STATUS, detailData.auditStatus) : '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <template v-if="detailData.categoryIdSet && detailData.categoryIdSet.length">
              <el-tag v-for="cid in detailData.categoryIdSet" :key="cid" size="small" style="margin-right: 4px; margin-bottom: 4px">
                {{ getCategoryName(cid) }}
              </el-tag>
            </template>
            <span v-else>无</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="附件">
        <template v-if="detailData.attachmentId">
          <!-- 图片预览 -->
          <template v-if="detailData.fileType === 'IMAGE' && attachmentUrl">
            <el-image
              :src="attachmentUrl"
              fit="contain"
              class="detail-preview-image"
              :preview-src-list="[attachmentUrl]"
              preview-teleported
              hide-on-click-modal
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
            />
          </template>
          <!-- 视频预览 -->
          <template v-else-if="detailData.fileType === 'VIDEO' && attachmentUrl">
            <video :src="attachmentUrl" controls class="detail-preview-video" />
          </template>
          <!-- 图片/视频加载中 -->
          <span v-else-if="detailData.fileType === 'IMAGE' || detailData.fileType === 'VIDEO'" class="attachment-loading">加载中…</span>
          <!-- 其他类型：点击下载 -->
          <el-button v-else size="small" type="primary" @click="downloadAttachment" :loading="downloadLoading">下载附件</el-button>
        </template>
        <span v-else>无</span>
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改时间">
            <el-input :model-value="formatTime(detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import {
    DICT_DATA_FILE_TYPE,
    DICT_DATA_MATERIAL_PROCESS_STATUS,
    DICT_DATA_MATERIAL_BUSINESS_STATUS,
    DICT_DATA_MATERIAL_AUDIT_STATUS
  } from '@/shared/constants/DictionaryEnum.constant'
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
  const downloadLoading = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({})
  const attachmentUrl = ref('')

  const getCategoryName = (categoryId: string): string => {
    return (props.categoryNameMap && props.categoryNameMap[categoryId]) || categoryId
  }

  const formatTime = (timestamp?: number) => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const loadAttachmentUrl = async (materialId: string) => {
    if (!materialId) {
      attachmentUrl.value = ''
      return
    }
    try {
      const url = await DataMaterialApi.getDownloadUrl({ id: materialId })
      attachmentUrl.value = url
    } catch {
      attachmentUrl.value = ''
    }
  }

  /** 非图片/视频类型：点击下载按钮触发下载 */
  const downloadAttachment = async () => {
    if (!props.materialId) return
    try {
      downloadLoading.value = true
      const url = await DataMaterialApi.getDownloadUrl({ id: props.materialId })
      window.open(url, '_blank')
    } catch {
      // 错误由 API 层处理
    } finally {
      downloadLoading.value = false
    }
  }

  const fetchDetail = async () => {
    if (!props.materialId) return
    try {
      loading.value = true
      const res = await DataMaterialApi.detail({ id: props.materialId })
      detailData.value = res || {}
      if (res?.attachmentId && (res.fileType === 'IMAGE' || res.fileType === 'VIDEO')) {
        await loadAttachmentUrl(props.materialId)
      } else {
        attachmentUrl.value = ''
      }
    } catch (error) {
      console.error('获取素材详情失败', error)
    } finally {
      loading.value = false
    }
  }

  const handleDialogClosed = () => {
    detailData.value = {}
    attachmentUrl.value = ''
    loading.value = false
    downloadLoading.value = false
  }

  watch(
    () => props.modelValue,
    val => {
      if (val && props.materialId) fetchDetail()
      else {
        attachmentUrl.value = ''
      }
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
  .detail-preview-video {
    max-width: 280px;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
  }
  .attachment-loading {
    color: var(--el-text-color-secondary);
  }

  .el-row {
    width: 100%;
  }
</style>
