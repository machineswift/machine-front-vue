<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    width="min(980px, 92vw)"
    align-center
    class="material-detail-dialog"
    @closed="handleClosed"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-main">
          <div class="header-title">{{ detailData.title || detailData.originalName || '素材详情' }}</div>
          <div class="header-tags">
            <el-tag size="small">{{ getTypeLabel(detailData.fileType) }}</el-tag>
            <el-tag v-if="detailData.versionNo" size="small" type="info">v{{ detailData.versionNo }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <el-tooltip content="上一条" placement="bottom">
            <el-button text :disabled="!hasPrev" @click="emit('prev')">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下一条" placement="bottom">
            <el-button text :disabled="!hasNext" @click="emit('next')">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </el-tooltip>
          <el-button text @click="visible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="detail-content">
      <div class="detail-preview-panel">
        <div class="detail-preview">
          <template v-if="detailData.attachmentId">
            <el-image
              v-if="detailData.fileType === 'IMAGE' && attachmentUrl"
              :src="attachmentUrl"
              fit="contain"
              class="preview-image"
              :preview-src-list="[attachmentUrl]"
              preview-teleported
              hide-on-click-modal
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
            />
            <video v-else-if="detailData.fileType === 'VIDEO' && attachmentUrl" :src="attachmentUrl" controls class="preview-video" />
            <div v-else-if="detailData.fileType === 'IMAGE' || detailData.fileType === 'VIDEO'" class="preview-placeholder">预览加载中…</div>
            <div v-else class="preview-file">
              <el-icon class="preview-file-icon"><component :is="getTypeIcon(detailData.fileType)" /></el-icon>
              <span class="preview-file-name">{{ detailData.originalName || '附件' }}</span>
              <el-button size="small" type="primary" :loading="downloadLoading" @click="downloadAttachment">下载附件</el-button>
            </div>
          </template>
          <el-empty v-else description="暂无附件" :image-size="60" />
        </div>
        <div v-if="detailData.fileType === 'IMAGE' && attachmentUrl" class="preview-tip">点击图片可查看大图</div>

        <div class="category-section">
          <div class="section-title">所属分类</div>
          <TreeCheckPanel
            ref="categoryTreePanelRef"
            v-model="checkedCategoryIds"
            :roots="categoryTreeOptions"
            :height="208"
            :expand-checked-only="checkedCategoryIds.length > 0"
            check-strictly
            readonly
            :closable-tags="false"
            :icon="FolderOpened"
            placeholder="输入分类名称或编码搜索"
            empty-tags-text="该素材未关联分类"
          />
        </div>
      </div>

      <div class="detail-info-panel">
        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="文件名称">{{ detailData.originalName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(detailData.size) }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ getTypeLabel(detailData.fileType) }}</el-descriptions-item>
          <el-descriptions-item label="业务状态">{{ getBusinessStatusLabel(detailData.businessStatus) }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">{{ getAuditStatusLabel(detailData.auditStatus) }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detailData.createName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detailData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="修改人">{{ detailData.updateName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ formatTime(detailData.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="引用">
            <span>{{ detailData.referenceCount ?? 0 }} 处</span>
            <el-popover v-if="detailData.referenceList?.length" placement="left" :width="320" trigger="click">
              <template #reference>
                <el-button link type="primary" size="small">查看明细</el-button>
              </template>
              <div class="reference-list">
                <div v-for="ref in detailData.referenceList" :key="`${ref.entity}-${ref.entityId}`" class="reference-item">
                  <el-tag size="small">{{ ref.entity || '未知实体' }}</el-tag>
                  <span class="reference-id">{{ ref.entityId }}</span>
                </div>
              </div>
            </el-popover>
          </el-descriptions-item>
        </el-descriptions>

        <div class="version-section">
          <div class="section-title">版本历史</div>
          <el-timeline v-if="versionList.length" class="version-timeline">
            <el-timeline-item
              v-for="version in versionList"
              :key="version.id"
              :timestamp="formatTime(version.changeTime || version.createTime)"
              placement="top"
            >
              <div class="version-item">
                <span class="version-no">v{{ version.versionNo }}</span>
                <el-tag v-if="version.isCurrent === 1" size="small" type="success">当前</el-tag>
                <el-tag size="small" type="info">{{ getChangeTypeLabel(version.changeType) }}</el-tag>
                <span v-if="version.changeDesc" class="version-desc">{{ version.changeDesc }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无版本记录" :image-size="48" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="emit('edit')" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE']">编辑</el-button>
        <el-button @click="emit('category')" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE_CATEGORY']">修改分类</el-button>
        <el-button :loading="downloadLoading" @click="downloadAttachment">下载</el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import type { Component } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, ArrowRight, Box, Close, Document, FolderOpened, Grid as GridIcon, Headset, Monitor, Picture, VideoCamera } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { DataMaterialApi, formatFileSize } from '@/modules/data/material/api/DataMaterial.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import { downloadByUrl } from '@/shared/utils/Download.util'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_DATA_FILE_TYPE, DICT_DATA_MATERIAL_AUDIT_STATUS, DICT_DATA_MATERIAL_BUSINESS_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import type { DataMaterialDetailResponseVo } from '@/modules/data/material/type/DataMaterial.type'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'
  import type { DataAttachmentVersionResponseVo } from '@/modules/data/attachment/type/DataAttachment.type'

  const props = defineProps<{
    modelValue: boolean
    materialId: string
    hasPrev: boolean
    hasNext: boolean
    categoryTree: DataMaterialCategorySimpleTreeResponseVo[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'prev'): void
    (e: 'next'): void
    (e: 'edit'): void
    (e: 'category'): void
  }>()

  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'

  const TYPE_ICON_MAP: Record<string, Component> = {
    IMAGE: Picture,
    VIDEO: VideoCamera,
    AUDIO: Headset,
    DOCUMENT: Document,
    SPREADSHEET: GridIcon,
    PRESENTATION: Monitor,
    ARCHIVE: Box
  }

  const CHANGE_TYPE_LABEL_MAP: Record<string, string> = {
    CREATE: '创建',
    UPDATE: '更新',
    ROLLBACK: '回滚',
    DELETE: '删除'
  }

  const enumStore = useDictionaryEnumStore()

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const loading = ref(false)
  const downloadLoading = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({})
  const attachmentUrl = ref('')
  const versionList = ref<DataAttachmentVersionResponseVo[]>([])
  const categoryTreePanelRef = ref<InstanceType<typeof TreeCheckPanel>>()
  const checkedCategoryIds = ref<string[]>([])

  const removeVirtualNode = (nodes: DataMaterialCategorySimpleTreeResponseVo[]): DataMaterialCategorySimpleTreeResponseVo[] =>
    nodes
      .filter(node => node.id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      .map(node => (node.children?.length ? { ...node, children: removeVirtualNode(node.children) } : node))

  /** 分类树：剔除「未分类」虚拟节点，只保留真实分类 */
  const categoryTreeOptions = computed(() => removeVirtualNode(props.categoryTree || []))

  const getTypeIcon = (fileType?: string) => (fileType ? TYPE_ICON_MAP[fileType] || Document : Document)
  const getTypeLabel = (fileType?: string) => (fileType ? enumStore.getEnumLabel(DICT_DATA_FILE_TYPE, fileType, fileType) : '-')
  const getBusinessStatusLabel = (status?: string) => (status ? enumStore.getEnumLabel(DICT_DATA_MATERIAL_BUSINESS_STATUS, status, status) : '-')
  const getAuditStatusLabel = (status?: string) => (status ? enumStore.getEnumLabel(DICT_DATA_MATERIAL_AUDIT_STATUS, status, status) : '-')
  const getChangeTypeLabel = (changeType?: string) => (changeType ? CHANGE_TYPE_LABEL_MAP[changeType] || changeType : '-')
  const formatTime = (timestamp?: number) => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const loadAttachmentUrl = async (attachmentId: string) => {
    if (!attachmentId) {
      attachmentUrl.value = ''
      return
    }
    try {
      const res = await DataAttachmentApi.preview(attachmentId)
      attachmentUrl.value = res?.url || ''
    } catch {
      attachmentUrl.value = ''
    }
  }

  const loadVersionList = async (attachmentId: string) => {
    if (!attachmentId) {
      versionList.value = []
      return
    }
    try {
      versionList.value = (await DataAttachmentApi.versionList(attachmentId)) || []
    } catch {
      versionList.value = []
    }
  }

  const downloadAttachment = async () => {
    const attachmentId = detailData.value.attachmentId
    if (!attachmentId) return
    try {
      downloadLoading.value = true
      const res = await DataAttachmentApi.download(attachmentId)
      if (!res?.url) {
        ElMessage.error('获取下载地址失败')
        return
      }
      await downloadByUrl(res.url, detailData.value.originalName || detailData.value.title || 'download')
    } catch (error) {
      console.error('下载附件失败:', error)
      ElMessage.error('下载附件失败')
    } finally {
      downloadLoading.value = false
    }
  }

  const fetchDetail = async () => {
    if (!props.materialId) return
    try {
      loading.value = true
      attachmentUrl.value = ''
      versionList.value = []
      const res = await DataMaterialApi.detail({ id: props.materialId })
      detailData.value = res || {}

      // 分类树回显：勾选该素材所属分类，只展开勾选节点所在路径
      checkedCategoryIds.value = (res?.categoryIdSet || []).filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      await nextTick()
      categoryTreePanelRef.value?.setCheckedKeys(checkedCategoryIds.value)

      const attachmentId = res?.attachmentId || ''
      if (attachmentId) {
        const tasks: Promise<unknown>[] = [loadVersionList(attachmentId)]
        if (res?.fileType === 'IMAGE' || res?.fileType === 'VIDEO') {
          tasks.push(loadAttachmentUrl(attachmentId))
        }
        await Promise.all(tasks)
      }
    } catch (error) {
      console.error('获取素材详情失败', error)
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    detailData.value = {}
    attachmentUrl.value = ''
    versionList.value = []
    checkedCategoryIds.value = []
    categoryTreePanelRef.value?.reset()
    loading.value = false
    downloadLoading.value = false
  }

  watch(
    [() => props.modelValue, () => props.materialId],
    ([modelValue]) => {
      if (modelValue && props.materialId) {
        fetchDetail()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .material-detail-dialog {
    :deep(.el-dialog__body) {
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .header-main {
    min-width: 0;
  }

  .header-title {
    overflow: hidden;
    font-size: 18px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-tags {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }

  .header-actions {
    display: flex;
    flex: none;
    gap: 2px;
    align-items: center;
  }

  .detail-content {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 20px;
    max-height: 68vh;
    padding-right: 4px;
    overflow-y: auto;
  }

  .detail-preview-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .detail-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: clamp(240px, 34vh, 380px);
    min-width: 0;
    padding: 12px;
    overflow: hidden;
    box-sizing: border-box;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .preview-image {
    display: block;
    flex: 0 1 auto;
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-width: 0;
    overflow: hidden;

    :deep(.el-image__inner) {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .preview-video {
    display: block;
    flex: 0 1 auto;
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-width: 0;
    object-fit: contain;
    background: #000;
    border-radius: 6px;
  }

  .preview-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .preview-placeholder {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .preview-file {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    max-width: 100%;
    min-width: 0;
  }

  .preview-file-icon {
    font-size: 42px;
    color: var(--el-text-color-secondary);
  }

  .preview-file-name {
    max-width: 100%;
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-info-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .category-section {
    min-width: 0;
  }

  .reference-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reference-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .reference-id {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .version-timeline {
    padding-left: 4px;
  }

  .version-item {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .version-no {
    font-weight: 600;
  }

  .version-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dialog-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  @media (max-width: 900px) {
    .detail-content {
      grid-template-columns: 1fr;
      max-height: 72vh;
    }

    .detail-preview {
      height: clamp(220px, 36vh, 360px);
    }
  }
</style>
