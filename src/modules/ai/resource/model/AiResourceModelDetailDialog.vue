<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="模型详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="5vh"
  >
    <el-form :model="state.detailData" label-width="120px" v-loading="state.loading">
      <el-form-item label="所属厂商">
        <el-select v-model="state.detailData.providerId" placeholder="请选择厂商" filterable disabled style="width: 100%">
          <el-option v-for="option in state.providerOptions" :key="option.id" :label="getProviderLabel(option.provider)" :value="option.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="模型名称">
        <el-input v-model="state.detailData.name" placeholder="模型名称" disabled />
      </el-form-item>

      <el-form-item label="模型编码">
        <el-input v-model="state.detailData.code" placeholder="模型编码" disabled />
      </el-form-item>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-divider content-position="left">扩展特性</el-divider>

      <el-form-item label="能力类型">
        <el-checkbox-group v-model="state.detailData.features.capabilityList" disabled>
          <el-checkbox v-for="option in state.capabilityOptions" :key="option.code" :label="option.code" :value="option.code">
            {{ option.message }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="模型特性">
        <el-checkbox-group v-model="state.detailData.features.featureList" disabled>
          <el-checkbox v-for="option in state.featureOptions" :key="option.code" :label="option.code" :value="option.code">
            {{ option.message }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="温度参数">
            <el-slider v-model="state.detailData.features.temperature" :min="0" :max="2" :step="0.1" show-input disabled style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上下文长度">
            <el-input-number
              v-model="state.detailData.features.tokenLimits.contextLength"
              :min="1"
              :max="99999999"
              :step="1000"
              placeholder="输入token上限"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="输出长度">
            <el-input-number
              v-model="state.detailData.features.tokenLimits.outputLength"
              :min="1"
              :max="99999999"
              :step="1000"
              placeholder="输出token上限"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input v-model="state.detailData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit disabled />
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive } from 'vue'
  import { AiResourceModelApi } from '@/modules/ai/resource/model/api/AiResourceModel.api'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import type { AiResourceModelDetailResponseVo } from '@/modules/ai/resource/model/type/AiResourceModel.type'
  import type { AiResourceProviderListResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  const DEFAULT_FEATURES = {
    capabilityList: [],
    featureList: [],
    temperature: 0.8,
    tokenLimits: {
      contextLength: undefined,
      outputLength: undefined
    }
  }

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    modelId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    providerOptions: [] as AiResourceProviderListResponseVo[],
    capabilityOptions: [] as Array<{ code: string; message: string }>,
    featureOptions: [] as Array<{ code: string; message: string }>,

    detailData: {
      features: { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } }
    } as AiResourceModelDetailResponseVo
  })

  const getProviderLabel = (provider: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('AiProviderEnum', provider)
    return enumItem?.message || provider
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

  const handleDialogClosed = () => {
    state.detailData = { features: { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } } } as AiResourceModelDetailResponseVo
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await AiResourceModelApi.detail({ id: props.modelId })
      state.detailData = {
        ...res,
        features: res.features ?? { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } }
      }
    } catch (error) {
      console.error('获取模型详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    [() => props.modelValue, () => props.modelId],
    async ([modelValue, modelId]) => {
      if (modelValue && modelId) {
        const [providerList, capabilityOptions, featureOptions] = await Promise.all([
          AiResourceProviderApi.listSimple().catch(() => []),
          enumStore.getEnumDataAsync('AiModelCapabilityEnum'),
          enumStore.getEnumDataAsync('AiModelFeatureEnum')
        ])

        state.providerOptions = providerList
        state.capabilityOptions = capabilityOptions
        state.featureOptions = featureOptions

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
