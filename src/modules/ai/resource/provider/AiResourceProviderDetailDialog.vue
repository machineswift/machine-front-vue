<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="厂商详情"
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
        <el-descriptions-item label="厂商">{{ providerName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
            {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="API基础地址" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.baseUrl }">{{ state.detailData.baseUrl || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="API密钥" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.apiKey }">{{ state.detailData.apiKey || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.description }">{{ state.detailData.description || '无' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) || '无' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive } from 'vue'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_AI_PROVIDER } from '@/shared/constants/DictionaryEnum.constant'
  import type { AiResourceProviderDetailResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  const { options: providerOptions, load: loadProviderOptions } = useEnumOptions(DICT_AI_PROVIDER)

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    providerId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])

  const DEFAULT_DETAIL: AiResourceProviderDetailResponseVo = {
    id: '',
    status: '',
    provider: '',
    baseUrl: '',
    apiKey: '',
    description: '',
    createTime: 0,
    updateTime: 0,
    createName: '',
    updateName: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    detailData: { ...DEFAULT_DETAIL }
  })

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

  /** 厂商文案（详情只返回 provider 编码，按枚举选项反查名称） */
  const providerName = computed(() => providerOptions.value.find(option => option.code === state.detailData.provider)?.message || '')

  const handleDialogClosed = () => {
    state.detailData = { ...DEFAULT_DETAIL }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await AiResourceProviderApi.detail({ id: props.providerId })
      state.detailData = res
    } catch (error) {
      console.error('获取厂商详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    [() => props.modelValue, () => props.providerId],
    async ([modelValue, providerId]) => {
      if (modelValue && providerId) {
        await loadProviderOptions()
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
