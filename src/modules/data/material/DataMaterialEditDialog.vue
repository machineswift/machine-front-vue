<template>
  <el-dialog v-model="visible" title="编辑素材" width="560px" :close-on-click-modal="false" @closed="handleClosed">
    <el-form ref="formRef" :model="form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item label="素材标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入素材标题" />
      </el-form-item>
      <el-form-item label="文件类型">
        <el-tag size="small">{{ getFileTypeLabel(detailData.fileType) }}</el-tag>
      </el-form-item>
      <el-form-item label="当前附件">
        <div v-if="detailData.attachmentId || currentAttachmentId" class="attachment-preview">
          <!-- 图片预览 -->
          <template v-if="detailData.fileType === 'IMAGE' && attachmentPreviewUrl">
            <el-image
              :src="attachmentPreviewUrl"
              fit="contain"
              class="preview-image material-preview-image"
              :preview-src-list="[attachmentPreviewUrl]"
              preview-teleported
              hide-on-click-modal
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
            />
          </template>
          <!-- 视频预览 -->
          <template v-else-if="detailData.fileType === 'VIDEO' && attachmentPreviewUrl">
            <video :src="attachmentPreviewUrl" controls class="preview-video" />
          </template>
          <!-- 图片/视频加载中 -->
          <span v-else-if="isPreviewLoading && (detailData.fileType === 'IMAGE' || detailData.fileType === 'VIDEO')" class="attachment-loading">加载中…</span>
          <!-- 图片/视频预览不可用 -->
          <span v-else-if="detailData.fileType === 'IMAGE' || detailData.fileType === 'VIDEO'" class="attachment-loading">预览暂不可用，保存后可正常查看</span>
          <!-- 其他类型：点击下载 -->
          <el-button v-else size="small" type="primary" @click="downloadAttachment" :loading="downloadLoading">下载附件</el-button>
          <div class="attachment-actions">
            <el-button size="small" type="primary" plain @click="triggerReplaceFile" :loading="uploading">更换附件</el-button>
            <input ref="replaceFileInputRef" type="file" class="hidden-file-input" @change="onReplaceFileChange" />
          </div>
        </div>
        <div v-else class="attachment-upload-tip">
          <span class="tip-text">暂无附件，请上传</span>
          <el-button size="small" type="primary" plain @click="triggerReplaceFile" :loading="uploading">上传附件</el-button>
          <input ref="replaceFileInputRef" type="file" class="hidden-file-input" @change="onReplaceFileChange" />
        </div>
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryIdSet">
        <div class="category-select-block">
          <el-alert title="请选择该素材所属的分类" type="info" show-icon :closable="false" class="category-alert" />
          <el-input v-model="categoryQuery" placeholder="请输入分类名称" @input="onCategoryQueryChanged" class="category-query-input" />
          <el-tree-v2
            ref="categoryTreeRef"
            :data="categoryTreeOptions"
            :props="categoryProps"
            :filter-method="categoryFilterMethod"
            @check="handleCategoryCheck"
            show-checkbox
            :height="220"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ElTreeV2 } from 'element-plus'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import { TreeDataUtil } from '@/common/utils/TreeData.util'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import type { DataMaterialDetailResponseVo, DataMaterialUpdateRequestVo } from '@/modules/data/material/type/DataMaterial.type'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'

  /** 未分类虚拟节点 id，与后端一致，该节点不可选为分类 */
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    materialId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const enumStore = useDictionaryEnumStore()
  const getFileTypeLabel = (code?: string) => (code ? enumStore.getEnumItemByCodeSync('DataFileTypeEnum', code)?.message || code : '无')

  const formRef = ref()
  const replaceFileInputRef = ref<HTMLInputElement>()
  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const uploading = ref(false)
  const downloadLoading = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({})
  const attachmentPreviewUrl = ref('')
  const isPreviewLoading = ref(false)
  const categoryTreeOptions = ref<(DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]>([])
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const categoryQuery = ref('')
  const categoryProps = { value: 'id', label: 'name', children: 'children', disabled: 'disabled' }

  /** 递归为虚拟节点设置 disabled，禁止选择为分类 */
  const setVirtualNodeDisabled = (nodes: (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]): void => {
    if (!nodes?.length) return
    for (const node of nodes) {
      if (node.id === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID) {
        node.disabled = true
      }
      if (node.children?.length) {
        setVirtualNodeDisabled(node.children as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[])
      }
    }
  }

  const form = ref<DataMaterialUpdateRequestVo>({
    id: '',
    title: '',
    categoryIdSet: []
  })

  /** 标记附件是否被更换过 */
  const isAttachmentChanged = ref(false)

  const rules = {
    title: [{ required: true, message: '请输入素材标题', trigger: 'blur' }]
  }

  const loadCategoryTree = async () => {
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
      const treeWithDisabled = JSON.parse(JSON.stringify(rawTree)) as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]
      setVirtualNodeDisabled(treeWithDisabled)
      categoryTreeOptions.value = treeWithDisabled
    } catch (error) {
      console.error('加载分类树失败', error)
    }
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(categoryQuery.value.trim())
    }
    if (categoryQuery.value.trim() === '') {
      categoryTreeRef.value?.setExpandedKeys([])
    }
  }

  const categoryFilterMethod = (query: string, node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      form.value.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(categoryTreeOptions.value, categoryTreeRef.value.getCheckedKeys())
        .map(node => node.id)
        .filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
    }
  }

  const syncCategoryTreeCheckedKeys = (ids: string[]) => {
    nextTick(() => {
      categoryTreeRef.value?.setCheckedKeys(ids || [])
    })
  }

  const loadAttachmentPreview = async (materialId: string) => {
    if (!materialId) {
      attachmentPreviewUrl.value = ''
      return
    }
    isPreviewLoading.value = true
    try {
      const url = await DataMaterialApi.getDownloadUrl({ id: materialId })
      attachmentPreviewUrl.value = url
    } catch {
      attachmentPreviewUrl.value = ''
    } finally {
      isPreviewLoading.value = false
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
      const attachmentId = res!.attachmentId || ''
      const categoryIdSet = res!.categoryIdSet ? [...res!.categoryIdSet].filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID) : []
      form.value = {
        id: res!.id!,
        title: res!.title || '',
        categoryIdSet
      }
      isAttachmentChanged.value = false
      if (attachmentId && (res!.fileType === 'IMAGE' || res!.fileType === 'VIDEO')) {
        await loadAttachmentPreview(props.materialId)
      } else {
        attachmentPreviewUrl.value = ''
      }
      syncCategoryTreeCheckedKeys(form.value.categoryIdSet || [])
    } catch (error) {
      console.error('获取素材详情失败', error)
    } finally {
      loading.value = false
    }
  }

  const triggerReplaceFile = () => {
    replaceFileInputRef.value?.click()
  }

  const currentAttachmentId = ref('')

  const onReplaceFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const f = target.files?.[0]
    if (!f || !form.value.id) return
    try {
      uploading.value = true
      const res = await DataAttachmentApi.upload({ file: f })
      const newId = res?.id
      if (newId) {
        currentAttachmentId.value = newId
        isAttachmentChanged.value = true
        // 文件已在前端内存，直接用 ObjectURL 本地预览，无需调后端接口
        if (detailData.value.fileType === 'IMAGE' || detailData.value.fileType === 'VIDEO') {
          if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
          previewObjectUrl = URL.createObjectURL(f)
          attachmentPreviewUrl.value = previewObjectUrl
        } else {
          attachmentPreviewUrl.value = ''
        }
        ElMessage.success('附件已更换，请点击保存')
      } else {
        ElMessage.error('上传失败')
      }
    } catch (err) {
      console.error('更换附件失败', err)
    } finally {
      uploading.value = false
      target.value = ''
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitting.value = true
      const categoryIdSet = form.value.categoryIdSet?.filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      const payload: DataMaterialUpdateRequestVo = {
        id: form.value.id,
        title: form.value.title,
        categoryIdSet: categoryIdSet?.length ? categoryIdSet : undefined
      }
      // 仅当附件被更换时传入 fileTemp
      if (isAttachmentChanged.value && currentAttachmentId.value) {
        payload.fileTemp = { fileId: currentAttachmentId.value }
      }
      await DataMaterialApi.update(payload)
      ElMessage.success('保存成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('保存素材失败', error)
    } finally {
      submitting.value = false
    }
  }

  let previewObjectUrl = ''

  const handleClosed = () => {
    formRef.value?.resetFields()
    // 释放本地 ObjectURL
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
      previewObjectUrl = ''
    }
    attachmentPreviewUrl.value = ''
    categoryQuery.value = ''
    currentAttachmentId.value = ''
    isAttachmentChanged.value = false
    if (replaceFileInputRef.value) replaceFileInputRef.value.value = ''
  }

  watch(
    () => props.modelValue,
    async val => {
      visible.value = val
      if (val && props.materialId) {
        await loadCategoryTree()
        await fetchDetail()
      }
    },
    { immediate: false }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })
</script>

<style scoped>
  .attachment-preview,
  .attachment-upload-tip {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .preview-image {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
  }
  .preview-video {
    max-width: 200px;
    max-height: 150px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
  }
  .preview-link {
    color: var(--el-color-primary);
    margin-right: 8px;
  }
  .attachment-actions,
  .attachment-upload-tip .tip-text {
    margin-right: 8px;
  }
  .hidden-file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
  }
  .category-select-block {
    width: 100%;
  }
  .category-alert {
    margin-bottom: 12px;
  }
  .category-query-input {
    margin-bottom: 10px;
  }
  .attachment-loading {
    color: var(--el-text-color-secondary);
  }
</style>
