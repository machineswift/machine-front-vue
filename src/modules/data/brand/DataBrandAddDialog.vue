<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="isChildMode ? '新增子品牌' : '新增品牌'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="640px"
    top="8vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="父品牌" v-if="isChildMode">
        <el-input :model-value="props.parentNode?.name || ''" disabled />
      </el-form-item>

      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入品牌名称" maxlength="32" show-word-limit />
      </el-form-item>

      <el-form-item label="排序" prop="sort" v-if="isChildMode">
        <el-input-number v-model="state.formData.sort" :min="0" :max="999999" controls-position="right" />
        <span class="form-tip">数值越大越靠前</span>
      </el-form-item>

      <el-form-item label="品牌LOGO" prop="logoFileId" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">
        <div class="logo-field">
          <el-image v-if="state.formData.logoUrl" :src="state.formData.logoUrl" fit="contain" class="logo-thumb" @click="handleViewLogoOrigin" />
          <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleLogoChange" :disabled="state.logoUploading" accept="image/*">
            <el-button type="primary" plain :loading="state.logoUploading">
              {{ state.formData.logoUrl ? '重新上传' : '选择图片' }}
            </el-button>
          </el-upload>
        </div>
        <span class="form-tip">支持图片，不超过 1MB</span>
      </el-form-item>

      <el-form-item label="品牌描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入品牌描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">确定</el-button>
    </template>

    <!-- LOGO 原图预览（刚选的文件本地地址就是原图） -->
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
  import { reactive, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule, UploadFile } from 'element-plus'
  import type { PropType } from 'vue'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataBrandCreateRequestVo, DataBrandExpandListResponseVo } from '@/modules/data/brand/type/DataBrand.type'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'

  /** LOGO 大小上限（MB） */
  const LOGO_MAX_SIZE_MB = 1

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    /** 传入则为「新增子品牌」：父品牌固定为它且只读，同时显示排序 */
    parentNode: { type: Object as PropType<DataBrandExpandListResponseVo | null>, default: null }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  /** 子品牌模式：父品牌来自列表行，不允许在弹窗里改 */
  const isChildMode = computed(() => !!props.parentNode?.id)

  const EMPTY_FORM_DATA = {
    name: '',
    sort: 0,
    logoFileId: '',
    logoUrl: '',
    description: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    logoUploading: false,
    logoViewerVisible: false,
    logoViewerUrlList: [] as string[],
    formData: { ...EMPTY_FORM_DATA }
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

  const validateLogo = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请上传品牌LOGO')
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    logoFileId: [{ required: true, validator: validateLogo, trigger: 'change' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const handleDialogClosed = () => {
    state.formData = { ...EMPTY_FORM_DATA }

    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl)
      logoObjectUrl = ''
    }

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    state.submitting = false
    state.logoUploading = false
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

  /** 查看原图（刚选的文件本地地址就是原图） */
  const handleViewLogoOrigin = () => {
    state.logoViewerUrlList = [logoObjectUrl || state.formData.logoUrl]
    state.logoViewerVisible = true
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      const payload: DataBrandCreateRequestVo = {
        name: state.formData.name.trim(),
        logoFile: { fileId: state.formData.logoFileId },
        description: state.formData.description
      }
      // 子品牌才带父品牌与排序（一级品牌按创建时间倒序）
      if (isChildMode.value) {
        payload.parentId = props.parentNode?.id
        payload.sort = state.formData.sort
      }

      await DataBrandApi.create(payload)

      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加品牌失败', error)
    } finally {
      state.submitting = false
    }
  }
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
