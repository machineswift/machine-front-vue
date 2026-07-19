<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑厂商"
    :loading="state.loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="20vh"
  >
    <el-form :model="state.formData" label-width="120px" :rules="state.rules" ref="formRef">
      <el-form-item label="厂商" prop="provider">
        <el-select v-model="state.formData.provider" disabled placeholder="请选择厂商">
          <el-option v-for="option in state.providerOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="API基础地址" prop="baseUrl">
        <el-input v-model="state.formData.baseUrl" placeholder="请输入API基础地址" />
      </el-form-item>

      <el-form-item label="API密钥" prop="apiKey">
        <el-input v-model="state.formData.apiKey" placeholder="不填则保持原值" type="password" show-password />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['AI:RESOURCE_CENTER:PROVIDER:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { ref, watch, reactive, computed, nextTick } from 'vue'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'

  const DEFAULT_FORM_DATA = {
    id: '',
    provider: '',
    baseUrl: '',
    apiKey: '',
    description: ''
  }

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    providerId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'refresh'])

  const formRef = ref()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),

    loading: false,
    submitting: false,
    providerOptions: [] as Array<{ code: string; message: string }>,

    formData: { ...DEFAULT_FORM_DATA },

    rules: {
      baseUrl: [
        { required: true, message: '请输入API基础地址', trigger: 'blur' },
        { pattern: /^https?:\/\/.+/, message: '请输入正确的URL格式', trigger: 'blur' }
      ]
    }
  })

  const handleDialogClosed = () => {
    state.formData = { ...DEFAULT_FORM_DATA }
    formRef.value?.resetFields()
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      await AiResourceProviderApi.update({
        id: state.formData.id,
        baseUrl: state.formData.baseUrl,
        apiKey: state.formData.apiKey || undefined,
        description: state.formData.description || undefined
      })

      ElMessage.success('修改成功')
      emit('refresh')
      state.dialogVisible = false
    } catch (error) {
      console.error('修改厂商失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await AiResourceProviderApi.detail({ id: props.providerId })

      Object.assign(state.formData, {
        id: res.id,
        provider: res.provider,
        baseUrl: res.baseUrl,
        apiKey: '',
        description: res.description || ''
      })

      nextTick(() => formRef.value?.clearValidate())
    } catch (error) {
      console.error('获取厂商详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (modelValue) {
        state.providerOptions = await enumStore.getEnumDataAsync('AiProviderEnum')
      }
    },
    { immediate: false }
  )

  watch(
    [() => props.modelValue, () => props.providerId],
    async ([modelValue, providerId]) => {
      if (modelValue && providerId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
