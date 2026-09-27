<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑品牌"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="640px"
    top="8vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="品牌编码">
        <el-input v-model="state.formData.code" disabled />
      </el-form-item>

      <el-form-item label="品牌全称">
        <el-input v-model="state.formData.fullName" disabled />
      </el-form-item>

      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入品牌名称" maxlength="32" show-word-limit />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="999999" controls-position="right" />
        <span class="form-tip">数值越大越靠前</span>
      </el-form-item>

      <el-form-item label="品牌LOGO" prop="logoFileId" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE']">
        <div class="logo-field">
          <el-image v-if="state.formData.logoUrl" :src="state.formData.logoUrl" fit="contain" class="logo-thumb" @click="handleViewLogoOrigin" />
          <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleLogoChange" :disabled="state.logoUploading" accept="image/*">
            <el-button type="primary" plain :loading="state.logoUploading">
              {{ state.formData.logoUrl ? '重新上传' : '选择图片' }}
            </el-button>
          </el-upload>
        </div>
        <span class="form-tip">不重新上传则保持原LOGO</span>
      </el-form-item>

      <el-form-item label="品牌描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入品牌描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE']">保存</el-button>
    </template>

    <!-- LOGO 原图预览（展示只有缩略图，点击时才去取原图） -->
    <el-image-viewer
      v-if="state.logoViewerVisible"
      :url-list="state.logoViewerUrlList"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      hide-on-click-modal
      teleported
      @close="state.logoViewerVisible = false"
    />
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { FormItemRule, FormInstance, UploadFile } from 'element-plus'
  import type { DataBrandUpdateRequestVo } from '@/modules/data/brand/type/DataBrand.type'

  /** LOGO 大小上限（MB） */
  const LOGO_MAX_SIZE_MB = 1

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'close', 'success'])
  const formRef = ref<FormInstance>()

  const DEFAULT_FORM_DATA = {
    id: '',
    code: '',
    fullName: '',
    name: '',
    sort: 0,
    logoFileId: '',
    logoUrl: '',
    logoAttachmentId: '',
    description: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    logoUploading: false,
    logoViewing: false,
    logoViewerVisible: false,
    logoViewerUrlList: [] as string[],
    formData: { ...DEFAULT_FORM_DATA }
  })

  /** 新选文件的本地预览地址（即原图，展示与查看都用它，不再请求后端） */
  let logoObjectUrl = ''

  // 表单验证规则
  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入品牌名称')
    if (value.length < 2 || value.length > 32) {
      return Promise.reject('长度在2到32个字符')
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject('只能包含中文、英文和数字')
    }
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  /** 展示用缩略图（原图只在点「查看原图」时去取） */
  const loadLogoUrl = async (logoAttachmentId?: string) => {
    if (!logoAttachmentId) return ''

    try {
      const response = await DataAttachmentApi.thumbnail(logoAttachmentId)
      return response?.url || ''
    } catch (error) {
      console.error('获取品牌LOGO缩略图失败', error)
      return ''
    }
  }

  const fetchDetail = async () => {
    try {
      state.loading = true
      const response = await DataBrandApi.detail({ id: props.brandId })
      const logoUrl = await loadLogoUrl(response.logoAttachmentId)

      state.formData = {
        id: response.id,
        code: response.code || '',
        fullName: response.fullName || '',
        name: response.name,
        sort: response.sort ?? 0,
        logoFileId: '',
        logoUrl,
        logoAttachmentId: response.logoAttachmentId || '',
        description: response.description || ''
      }
    } catch (error) {
      console.error('获取品牌详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = { ...DEFAULT_FORM_DATA }

    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl)
      logoObjectUrl = ''
    }

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    state.loading = false
    state.submitting = false
    state.logoUploading = false
    state.logoViewing = false
    state.logoViewerVisible = false
    state.logoViewerUrlList = []
  }

  /** 选择图片：上传为临时文件拿 fileId，本地地址直接预览 */
  const handleLogoChange = async (file: UploadFile) => {
    const raw = file.raw
    if (!raw) return

    if (!raw.type.includes('image')) {
      ElMessage.error('只能上传图片文件!')
      return
    }
    if (raw.size / 1024 / 1024 >= LOGO_MAX_SIZE_MB) {
      ElMessage.error(`图片大小不能超过 ${LOGO_MAX_SIZE_MB}MB!`)
      return
    }

    try {
      state.logoUploading = true
      const response = await DataAttachmentApi.upload({ file: raw })

      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl)
      logoObjectUrl = URL.createObjectURL(raw)

      state.formData.logoFileId = response.id
      state.formData.logoUrl = logoObjectUrl
      ElMessage.success('LOGO上传成功')
    } catch (error) {
      console.error('上传品牌LOGO失败', error)
    } finally {
      state.logoUploading = false
    }
  }

  /** 查看原图：新选的文件本地地址就是原图，已保存的才按需去取 */
  const handleViewLogoOrigin = async () => {
    if (state.logoViewing) return

    let originUrl = logoObjectUrl
    if (!originUrl && state.formData.logoAttachmentId) {
      try {
        state.logoViewing = true
        const response = await DataAttachmentApi.preview(state.formData.logoAttachmentId)
        originUrl = response?.url || ''
      } catch (error) {
        console.error('获取品牌LOGO原图失败', error)
      } finally {
        state.logoViewing = false
      }
    }

    state.logoViewerUrlList = [originUrl || state.formData.logoUrl]
    state.logoViewerVisible = true
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      const payload: DataBrandUpdateRequestVo = {
        id: state.formData.id,
        name: state.formData.name.trim(),
        sort: state.formData.sort,
        description: state.formData.description
      }
      // 重新上传了LOGO才提交，不传表示保持原LOGO
      if (state.formData.logoFileId) {
        payload.logoFile = { fileId: state.formData.logoFileId }
      }

      await DataBrandApi.update(payload)

      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改品牌失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.brandId],
    async ([modelValue, brandId]) => {
      if (modelValue && brandId) {
        await fetchDetail()
      }
    },
    { immediate: false }
  )
</script>

<style scoped>
  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .logo-field {
    display: flex;
    align-items: center;
    gap: 8px;

    /* 点击看原图 */
    .logo-thumb {
      width: 60px;
      height: 60px;
      cursor: zoom-in;
      border-radius: 4px;
      overflow: hidden;
    }
  }
</style>
