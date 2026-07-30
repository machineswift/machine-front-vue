<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑模型"
    :loading="state.loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="5vh"
  >
    <el-form :model="state.formData" label-width="120px" :rules="state.rules" ref="formRef">
      <el-form-item label="所属厂商" prop="providerId">
        <el-select v-model="state.formData.providerId" placeholder="请选择厂商" filterable disabled>
          <el-option v-for="option in state.providerOptions" :key="option.id" :label="getProviderLabel(option.provider)" :value="option.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="模型名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入模型名称" />
      </el-form-item>

      <el-form-item label="模型编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入模型编码" />
      </el-form-item>

      <el-divider content-position="left">扩展特性</el-divider>

      <el-form-item label="能力类型">
        <el-checkbox-group v-model="state.formData.features.capabilityList">
          <el-checkbox v-for="option in state.capabilityOptions" :key="option.code" :label="option.code" :value="option.code">
            {{ option.message }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="模型特性">
        <el-checkbox-group v-model="state.formData.features.featureList">
          <el-checkbox v-for="option in state.featureOptions" :key="option.code" :label="option.code" :value="option.code">
            {{ option.message }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="温度参数">
            <el-slider v-model="state.formData.features.temperature" :min="0" :max="2" :step="0.1" show-input style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上下文长度">
            <el-input-number
              v-model="state.formData.features.tokenLimits.contextLength"
              :min="1"
              :max="99999999"
              :step="1000"
              placeholder="输入token上限"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="输出长度">
            <el-input-number
              v-model="state.formData.features.tokenLimits.outputLength"
              :min="1"
              :max="99999999"
              :step="1000"
              placeholder="输出token上限"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:MODEL:UPDATE']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { ref, watch, reactive, computed, nextTick } from 'vue'
  import { AiResourceModelApi } from '@/modules/ai/resource/model/api/AiResourceModel.api'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { AiResourceProviderListResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'
  import type { AiModelFeaturesDto } from '@/modules/ai/resource/model/type/AiResourceModel.type'

  const DEFAULT_FEATURES: AiModelFeaturesDto = {
    capabilityList: [],
    featureList: [],
    temperature: 0.8,
    tokenLimits: {
      contextLength: undefined,
      outputLength: undefined
    }
  }

  const DEFAULT_FORM_DATA = {
    id: '',
    providerId: '',
    name: '',
    code: '',
    features: { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } },
    description: ''
  }

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    modelId: { type: String, required: true }
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

    providerOptions: [] as AiResourceProviderListResponseVo[],
    capabilityOptions: [] as Array<{ code: string; message: string }>,
    featureOptions: [] as Array<{ code: string; message: string }>,

    formData: JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)),

    rules: {
      name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入模型编码', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ]
    }
  })

  const getProviderLabel = (provider: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('AiProviderEnum', provider)
    return enumItem?.message || provider
  }

  const handleDialogClosed = () => {
    state.formData = JSON.parse(JSON.stringify(DEFAULT_FORM_DATA))
    formRef.value?.resetFields()
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      // 清理空值
      const features = JSON.parse(JSON.stringify(state.formData.features))
      if (!features.capabilityList?.length) delete features.capabilityList
      if (!features.featureList?.length) delete features.featureList
      if (features.tokenLimits?.contextLength == null && features.tokenLimits?.outputLength == null) {
        delete features.tokenLimits
      }

      await AiResourceModelApi.update({
        id: state.formData.id,
        name: state.formData.name,
        code: state.formData.code,
        features: features,
        description: state.formData.description || undefined
      })

      ElMessage.success('修改成功')
      emit('refresh')
      state.dialogVisible = false
    } catch (error) {
      console.error('修改模型失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await AiResourceModelApi.detail({ id: props.modelId })

      state.formData = {
        id: res.id,
        providerId: res.providerId,
        name: res.name,
        code: res.code,
        features: res.features ?? JSON.parse(JSON.stringify(DEFAULT_FEATURES)),
        description: res.description || ''
      }

      nextTick(() => formRef.value?.clearValidate())
    } catch (error) {
      console.error('获取模型详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (modelValue) {
        const [providerList, capabilityOptions, featureOptions] = await Promise.all([
          AiResourceProviderApi.listSimple().catch(() => []),
          enumStore.getEnumDataAsync('AiModelCapabilityEnum'),
          enumStore.getEnumDataAsync('AiModelFeatureEnum')
        ])

        state.providerOptions = providerList
        state.capabilityOptions = capabilityOptions
        state.featureOptions = featureOptions
      }
    },
    { immediate: false }
  )

  watch(
    [() => props.modelValue, () => props.modelId],
    async ([modelValue, modelId]) => {
      if (modelValue && modelId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
