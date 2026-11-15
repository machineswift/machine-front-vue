<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="模型详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="所属厂商">{{ providerName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="模型名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
        <el-descriptions-item label="模型编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
            {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 扩展特性 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="扩展特性">
        <el-descriptions-item label="能力类型" :span="2">
          <el-checkbox-group v-model="state.detailData.features.capabilityList" disabled>
            <el-checkbox v-for="option in capabilityOptions" :key="option.code" :label="option.code" :value="option.code">
              {{ option.message }}
            </el-checkbox>
          </el-checkbox-group>
        </el-descriptions-item>
        <el-descriptions-item label="模型特性" :span="2">
          <el-checkbox-group v-model="state.detailData.features.featureList" disabled>
            <el-checkbox v-for="option in featureOptions" :key="option.code" :label="option.code" :value="option.code">
              {{ option.message }}
            </el-checkbox>
          </el-checkbox-group>
        </el-descriptions-item>
        <el-descriptions-item label="温度参数">{{ state.detailData.features.temperature ?? '无' }}</el-descriptions-item>
        <el-descriptions-item label="上下文长度">{{ state.detailData.features.tokenLimits.contextLength ?? '无' }}</el-descriptions-item>
        <el-descriptions-item label="输出长度">{{ state.detailData.features.tokenLimits.outputLength ?? '无' }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.description }">{{ state.detailData.description || '无' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive } from 'vue'
  import { AiResourceModelApi } from '@/modules/ai/resource/model/api/AiResourceModel.api'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_AI_MODEL_CAPABILITY, DICT_AI_MODEL_FEATURE, DICT_AI_PROVIDER } from '@/shared/constants/DictionaryEnum.constant'
  import type { AiResourceModelDetailResponseVo, AiModelFeaturesDto, TokenLimits } from '@/modules/ai/resource/model/type/AiResourceModel.type'
  import type { AiResourceProviderListResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  type DetailData = AiResourceModelDetailResponseVo & {
    features: AiModelFeaturesDto & { tokenLimits: TokenLimits }
  }

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

  const { options: capabilityOptions, load: loadCapabilityOptions } = useEnumOptions(DICT_AI_MODEL_CAPABILITY)
  const { options: featureOptions, load: loadFeatureOptions } = useEnumOptions(DICT_AI_MODEL_FEATURE)

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

    detailData: {
      features: { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } }
    } as unknown as DetailData
  })

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

  /** 所属厂商文案（详情只返回 providerId，按厂商选项反查枚举名称） */
  const providerName = computed(() => {
    const option = state.providerOptions.find(item => item.id === state.detailData.providerId)
    return option ? enumStore.getEnumLabel(DICT_AI_PROVIDER, option.provider) : ''
  })

  const handleDialogClosed = () => {
    state.detailData = { features: { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } } } as unknown as DetailData
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await AiResourceModelApi.detail({ id: props.modelId })
      state.detailData = {
        ...res,
        features: res.features ?? { ...DEFAULT_FEATURES, tokenLimits: { ...DEFAULT_FEATURES.tokenLimits } }
      } as unknown as DetailData
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
        const [providerList] = await Promise.all([
          AiResourceProviderApi.listSimple().catch(() => []),
          enumStore.getEnumDataAsync(DICT_AI_PROVIDER),
          loadCapabilityOptions(),
          loadFeatureOptions()
        ])

        state.providerOptions = providerList

        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
