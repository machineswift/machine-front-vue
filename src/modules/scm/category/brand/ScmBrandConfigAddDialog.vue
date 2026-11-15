<template>
  <el-dialog
    v-model="state.visible"
    title="新增品牌配置"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="品牌" prop="brandId">
        <el-input :model-value="state.brandName" placeholder="请选择品牌" readonly class="brand-select-input" @click="state.brandSelectVisible = true">
          <template #suffix>
            <el-icon class="brand-select-icon" @click.stop="state.brandSelectVisible = true"><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="state.formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="扩展特性" prop="features">
        <el-input
          v-model="state.formData.features"
          type="textarea"
          :rows="3"
          placeholder='可选，扩展特性JSON，例如 {"key":"value"}'
          maxlength="1024"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 品牌快速选择（data 品牌，排除已建立配置的品牌） -->
    <QuickSelectHost
      kind="data.brand"
      v-model="state.brandSelectVisible"
      :fetch-page="ScmBrandConfigApi.pageSelectable"
      confirm-permission="MANAGE_APP:SCM:BRAND_CONFIG:PAGE_SELECTABLE"
      @confirm="handleBrandSelected"
    />

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.create]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'
  import QuickSelectHost from '@/shared/components/QuickSelectHost.vue'
  import type { ScmBrandConfigCreateRequestVo } from '@/modules/scm/category/brand/type/ScmBrandConfig.type'
  import type { BrandSummaryDto } from '@/shared/types/CommonBusiness.type'

  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:BRAND_CONFIG:CREATE'
  }

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_STATUS)

  const emptyFormData = (): ScmBrandConfigCreateRequestVo => ({
    brandId: '',
    status: 'ENABLE',
    features: ''
  })

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    brandSelectVisible: false,
    brandName: '',
    formData: emptyFormData()
  })

  /** 扩展特性是自由 JSON，提交前校验格式，避免脏数据落到后端 */
  const validateFeatures = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback()
      return
    }
    try {
      JSON.parse(value)
      callback()
    } catch {
      callback(new Error('扩展特性必须是合法的JSON'))
    }
  }

  const rules = {
    brandId: [{ required: true, message: '请选择品牌', trigger: ['blur', 'change'] }],
    status: [{ required: true, message: '请选择状态', trigger: ['blur', 'change'] }],
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  const handleBrandSelected = (brands: BrandSummaryDto[]) => {
    const brand = brands[0]
    if (!brand) return
    state.formData.brandId = brand.id
    state.brandName = brand.name
    state.brandSelectVisible = false
    formRef.value?.validateField('brandId')
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmBrandConfigApi.create(state.formData)
      ElMessage.success('新增品牌配置成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增品牌配置失败', error)
    } finally {
      state.submitting = false
    }
  }

  const resetForm = () => {
    state.formData = emptyFormData()
    state.brandName = ''
    state.brandSelectVisible = false
    state.submitting = false
    formRef.value?.resetFields()
  }

  const handleDialogClosed = () => resetForm()

  watch(
    () => props.modelValue,
    async modelValue => {
      if (!modelValue) return
      resetForm()
      await loadStatusOptions()
    }
  )
</script>

<style scoped lang="scss">
  .brand-select-input {
    cursor: pointer;

    :deep(.el-input__inner) {
      cursor: pointer;
    }
  }

  .brand-select-icon {
    cursor: pointer;
  }
</style>
