<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加厂商"
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
        <el-select v-model="state.formData.provider" placeholder="请选择厂商">
          <el-option v-for="option in state.providerOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="API基础地址" prop="baseUrl">
        <el-input v-model="state.formData.baseUrl" placeholder="请输入API基础地址，如 https://api.deepseek.com" />
      </el-form-item>

      <el-form-item label="API密钥" prop="apiKey">
        <el-input v-model="state.formData.apiKey" placeholder="请输入API密钥" type="password" show-password />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['AI:RESOURCE_CENTER:PROVIDER:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'

  const DEFAULT_FORM_DATA = {
    provider: '',
    baseUrl: '',
    apiKey: '',
    description: ''
  }

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const formRef = ref()

  const state = reactive({
    submitting: false,
    providerOptions: [] as Array<{ code: string; message: string }>,

    formData: { ...DEFAULT_FORM_DATA },

    rules: {
      provider: [{ required: true, message: '请选择厂商', trigger: 'change' }],
      baseUrl: [
        { required: true, message: '请输入API基础地址', trigger: 'blur' },
        { pattern: /^https?:\/\/.+/, message: '请输入正确的URL格式，以 http:// 或 https:// 开头', trigger: 'blur' }
      ],
      apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }]
    }
  })

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      await AiResourceProviderApi.create({
        provider: state.formData.provider,
        baseUrl: state.formData.baseUrl,
        apiKey: state.formData.apiKey,
        description: state.formData.description || undefined
      })

      ElMessage.success('添加成功')
      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('添加厂商失败', error)
    } finally {
      state.submitting = false
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    state.formData = { ...DEFAULT_FORM_DATA }
  }

  const handleDialogClosed = () => {
    resetForm()
    state.submitting = false
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
</script>
