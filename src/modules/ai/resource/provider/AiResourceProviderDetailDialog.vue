<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="厂商详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="10vh"
  >
    <el-form :model="state.detailData" label-width="120px" v-loading="state.loading">
      <el-form-item label="厂商">
        <el-select v-model="state.detailData.provider" placeholder="请选择厂商" disabled style="width: 100%">
          <el-option v-for="option in state.providerOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-form-item label="API基础地址">
        <el-input v-model="state.detailData.baseUrl" placeholder="API基础地址" disabled />
      </el-form-item>

      <el-form-item label="API密钥">
        <el-input :model-value="state.detailData.apiKey" placeholder="API密钥" disabled />
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="state.detailData.description" type="textarea" :rows="4" placeholder="描述" maxlength="512" show-word-limit disabled />
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
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import type { AiResourceProviderDetailResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  const enumStore = useDictionaryEnumStore()

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

    providerOptions: [] as Array<{ code: string; message: string }>,

    detailData: { ...DEFAULT_DETAIL }
  })

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

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
        state.providerOptions = await enumStore.getEnumDataAsync('AiProviderEnum')
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
