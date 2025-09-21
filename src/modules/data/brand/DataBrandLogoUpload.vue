<template>
  <el-upload
    class="logo-uploader"
    drag
    action="#"
    :show-file-list="false"
    :auto-upload="false"
    :on-change="handleUpload"
    :on-remove="handleRemove"
    :disabled="uploading"
    :before-upload="beforeUpload"
    accept="image/*"
  >
    <el-image v-if="imageUrl" :src="imageUrl" class="logo-preview" fit="contain" />
    <template v-else>
      <el-icon class="uploader-icon">
        <UploadFilled />
      </el-icon>
      <div class="el-upload__text">
        拖拽上传或
        <em>点击上传</em>
      </div>
    </template>
    <template #tip>
      <div class="el-upload__tip" v-if="uploading">上传中...</div>
      <div class="el-upload__tip" v-else>上传图片，不超过1MB</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import type { UploadFile, UploadRawFile, UploadFiles } from 'element-plus'
  import type { DataMaterialUploadParams } from '@/modules/data/types'

  const props = defineProps({
    modelMaterialId: { type: String, default: '' },
    modelImageUrl: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelMaterialId', 'update:modelImageUrl'])

  const uploading = ref(false)
  const imageUrl = ref(props.modelImageUrl)

  // 处理上传
  const handleUpload = async (file: UploadFile, _fileList: UploadFiles) => {
    if (!file.raw || !beforeUpload(file.raw)) return false

    try {
      uploading.value = true
      const params: DataMaterialUploadParams = {
        file: file.raw,
        storageType: 'PERMANENT',
        materIalType: 'IMAGE'
      }

      const response = await DataMaterialApi.upload(params)
      const detail = await DataMaterialApi.detail({ id: response.id })

      emit('update:modelMaterialId', response.id)
      emit('update:modelImageUrl', detail.url)
      imageUrl.value = detail.url

      ElMessage.success('LOGO上传成功')
      return true
    } catch (error) {
      console.error('上传品牌LOGO失败', error)
      return false
    } finally {
      uploading.value = false
    }
  }

  // 处理删除
  const handleRemove = () => {
    emit('update:modelMaterialId', '')
    emit('update:modelImageUrl', '')
    imageUrl.value = ''
    ElMessage.success('已移除LOGO')
  }

  // 上传前校验
  const beforeUpload = (file: UploadRawFile) => {
    const isImage = file.type.includes('image')
    const isLt1M = file.size / 1024 / 1024 < 1

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }

    if (!isLt1M) {
      ElMessage.error('图片大小不能超过 1MB!')
      return false
    }

    return true
  }

  // 获取详情
  const fetchData = async () => {
    try {
      uploading.value = true
      imageUrl.value = props.modelImageUrl
    } finally {
      uploading.value = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelMaterialId, () => props.modelImageUrl],
    async ([modelMaterialId, modelImageUrl]) => {
      if (modelMaterialId && modelImageUrl) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .logo-uploader {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: var(--el-color-primary);
    }

    :deep(.el-upload) {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 100%;
      padding: 0;
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .uploader-icon {
      font-size: 28px;
      color: #8c939d;
      margin-bottom: 8px;
    }

    .el-upload__text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;

      em {
        color: var(--el-color-primary);
        font-style: normal;
      }
    }

    .logo-preview {
      width: 100%;
      height: 100%;
      display: block;
    }

    .el-upload__tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 7px;
      text-align: center;
    }
  }
</style>
