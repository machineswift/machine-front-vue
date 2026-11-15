<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="新增素材"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <el-form :model="state.form" :rules="rules" label-width="90px" ref="formRef" v-loading="state.loading" class="dialog-form">
      <el-form-item label="素材标题" prop="title">
        <el-input v-model="state.form.title" placeholder="选择文件后自动填充，可修改" maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="state.form.fileType" placeholder="选择文件后自动识别" clearable style="width: 100%">
          <el-option v-for="option in fileTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
        <div v-if="isTypeMismatch" class="form-tip form-tip-warning">文件扩展名识别为“{{ getTypeLabel(state.detectedFileType) }}”，与所选类型不一致</div>
      </el-form-item>

      <el-form-item label="上传文件" required>
        <el-upload
          ref="uploadRef"
          v-model:file-list="state.fileList"
          class="material-upload"
          drag
          :limit="1"
          :accept="accept"
          :http-request="handleUpload"
          :before-upload="beforeUpload"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
          :disabled="state.submitting"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持图片、视频、文档等，单文件不超过 {{ MATERIAL_FILE_MAX_SIZE_MB }}MB；上传后自动识别类型与标题</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        :disabled="!state.uploadedFileId"
        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:CREATE']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, UploadInstance, UploadProps, UploadProgressEvent, UploadRequestOptions, UploadUserFile } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import {
    DataMaterialApi,
    MATERIAL_FILE_MAX_SIZE_MB,
    detectFileTypeByExtension,
    getAcceptByFileType,
    stripFileExtension,
    validateMaterialFile
  } from '@/modules/data/material/api/DataMaterial.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_DATA_FILE_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import type { DataMaterialCreateRequestVo } from '@/modules/data/material/type/DataMaterial.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()
  const uploadRef = ref<UploadInstance>()
  const enumStore = useDictionaryEnumStore()

  const { options: fileTypeOptions, load: loadFileTypeOptions } = useEnumOptions(DICT_DATA_FILE_TYPE)

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    uploadedFileId: '',
    detectedFileType: '',
    autoTitle: '',
    fileList: [] as UploadUserFile[],
    form: {
      fileType: '',
      title: '',
      fileTemp: { fileId: '' }
    } as DataMaterialCreateRequestVo
  })

  const rules = {
    fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
    title: [{ required: true, message: '请输入素材标题', trigger: 'blur' }]
  }

  /** 已选类型时限制可选文件范围；未选类型时允许任意文件以自动识别 */
  const accept = computed(() => getAcceptByFileType(state.form.fileType))

  const isTypeMismatch = computed(() => !!state.detectedFileType && !!state.form.fileType && state.detectedFileType !== state.form.fileType)

  const getTypeLabel = (code?: string) => (code ? enumStore.getEnumLabel(DICT_DATA_FILE_TYPE, code, code) : '-')

  const beforeUpload: UploadProps['beforeUpload'] = file => {
    const validation = validateMaterialFile(file)
    if (!validation.valid) {
      ElMessage.error(validation.message || '文件校验失败')
      return false
    }

    const detected = detectFileTypeByExtension(file.name)
    state.detectedFileType = detected || ''
    if (detected) {
      state.form.fileType = detected
    }

    if (!state.form.title || state.form.title === state.autoTitle) {
      state.form.title = stripFileExtension(file.name)
      state.autoTitle = state.form.title
    }

    state.uploadedFileId = ''
    return true
  }

  const handleUpload = async (options: UploadRequestOptions) => {
    try {
      const res = await DataAttachmentApi.upload({
        file: options.file,
        onProgress: percent => options.onProgress({ percent } as UploadProgressEvent)
      })
      if (!res?.id) {
        throw new Error('上传失败')
      }
      state.uploadedFileId = res.id
      options.onSuccess(res)
    } catch (error) {
      options.onError(error as Parameters<typeof options.onError>[0])
    }
  }

  const handleRemove = () => {
    state.uploadedFileId = ''
    state.detectedFileType = ''
  }

  const handleExceed = () => {
    ElMessage.warning('只能上传一个文件，请先移除已选文件')
  }

  const resetState = () => {
    state.form = { fileType: '', title: '', fileTemp: { fileId: '' } }
    state.uploadedFileId = ''
    state.detectedFileType = ''
    state.autoTitle = ''
    state.fileList = []
    state.submitting = false
    formRef.value?.resetFields()
    uploadRef.value?.clearFiles()
  }

  const handleDialogClosed = () => {
    resetState()
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      if (!state.form.title.trim()) {
        ElMessage.warning('请输入素材标题')
        return
      }
      if (!state.uploadedFileId) {
        ElMessage.warning('请等待文件上传完成')
        return
      }
      if (isTypeMismatch.value) {
        ElMessage.warning('文件类型与所选文件不一致，请重新选择文件或调整类型')
        return
      }

      state.submitting = true
      const payload: DataMaterialCreateRequestVo = {
        fileType: state.form.fileType,
        title: state.form.title.trim(),
        fileTemp: { fileId: state.uploadedFileId }
      }
      await DataMaterialApi.create(payload)
      ElMessage.success('新增成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('新增素材失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (modelValue) {
        state.loading = true
        try {
          await loadFileTypeOptions()
        } finally {
          state.loading = false
        }
      }
    },
    { immediate: false }
  )
</script>

<style scoped>
  .dialog-form {
    max-height: 60vh;
    overflow-y: auto;
  }
  .material-upload {
    width: 100%;
  }
  .material-upload :deep(.el-upload-dragger) {
    padding: 20px 12px;
  }
  .form-tip {
    width: 100%;
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .form-tip-warning {
    color: var(--el-color-warning);
  }
</style>
