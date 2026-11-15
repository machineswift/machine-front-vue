<template>
  <el-dialog
    v-model="state.visible"
    title="编辑品牌配置"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right" v-loading="state.loading">
      <el-form-item label="品牌">
        <el-input v-model="state.brandName" disabled />
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

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.update]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'

  const PERMISSION_CODE = {
    update: 'MANAGE_APP:SCM:BRAND_CONFIG:UPDATE'
  }

  const props = defineProps<{
    modelValue: boolean
    configId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    brandName: '',
    formData: {
      id: '',
      features: ''
    }
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
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  const fetchData = async () => {
    if (!props.configId) return

    try {
      state.loading = true
      const res = await ScmBrandConfigApi.detail({ id: props.configId })
      state.formData.id = res.id
      state.formData.features = res.features || ''
      state.brandName = res.name || res.brandId
    } catch (error) {
      console.error('获取品牌配置详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmBrandConfigApi.update({ id: state.formData.id, features: state.formData.features })
      ElMessage.success('编辑品牌配置成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('编辑品牌配置失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = { id: '', features: '' }
    state.brandName = ''
    state.loading = false
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch(
    [() => props.modelValue, () => props.configId],
    async ([modelValue, configId]) => {
      if (modelValue && configId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss"></style>
