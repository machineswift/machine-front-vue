<template>
  <el-dialog v-model="visible" title="上传素材" width="600px" :close-on-click-modal="false" @closed="handleClosed">
    <el-form ref="formRef" :model="form" label-width="100px" :rules="rules">
      <el-form-item label="素材类型" prop="materIalType">
        <el-select v-model="form.materIalType" placeholder="请选择素材类型" style="width: 100%">
          <el-option v-for="option in materialTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="选择文件" prop="file">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action=""
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">请上传单个文件</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="素材标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入素材标题" />
      </el-form-item>

      <el-form-item label="过期时间">
        <el-date-picker v-model="form.expireTime" type="datetime" placeholder="选择过期时间" value-format="x" :disabled-date="disabledDate" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入素材描述" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { UploadFile, UploadFiles, UploadInstance } from 'element-plus'
  import type { DataMaterialUploadParams, DataMaterialCreateRequestVo } from '@/modules/data/material/type/DataMaterial.type'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const enumStore = useDictionaryEnumStore()
  const formRef = ref()
  const uploadRef = ref<UploadInstance>()
  const visible = ref(false)
  const loading = ref(false)
  const fileList = ref<UploadFile[]>([])
  const file = ref<File>()

  const form = ref<DataMaterialCreateRequestVo>({
    materialId: '',
    type: '',
    title: '',
    description: '',
    expireTime: undefined
  })

  const rules = {
    materIalType: [{ required: true, message: '请选择素材类型', trigger: 'change' }],
    file: [{ required: true, message: '请上传文件', trigger: 'change' }],
    title: [{ required: true, message: '请输入素材标题', trigger: 'blur' }]
  }

  const materialTypeOptions = ref<Array<{ code: string; message: string }>>([])

  // 禁用今天之前的日期
  const disabledDate = (time: Date) => {
    return time.getTime() < Date.now() - 8.64e7
  }

  const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    if (uploadFiles.length > 0) {
      file.value = uploadFile.raw as File
    }
  }

  const handleFileRemove = () => {
    file.value = undefined
  }

  const handleSubmit = async () => {
    if (!(await formRef.value.validate())) return
    if (!file.value) {
      ElMessage.warning('请上传文件')
      return
    }

    try {
      loading.value = true
      const uploadParams: DataMaterialUploadParams = {
        file: file.value,
        materIalType: form.value.type
      }

      const uploadRes = await DataMaterialApi.upload(uploadParams)

      const createParams: DataMaterialCreateRequestVo = {
        materialId: uploadRes.id,
        type: form.value.type,
        title: form.value.title,
        description: form.value.description,
        expireTime: form.value.expireTime
      }

      await DataMaterialApi.create(createParams)
      ElMessage.success('上传成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('上传素材失败', error)
      ElMessage.error('上传失败')
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value.resetFields()
    uploadRef.value?.clearFiles()
    fileList.value = []
    file.value = undefined
  }

  watch(
    () => props.modelValue,
    val => {
      visible.value = val
    }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })

  // 初始化枚举数据
  const initEnums = async () => {
    materialTypeOptions.value = await enumStore.getEnumDataAsync('DataMaterialTypeEnum')
  }

  initEnums()
</script>

<style scoped>
  .upload-demo {
    width: 100%;
  }
</style>
