<template>
  <el-dialog
    v-model="state.visible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    width="clamp(440px, 42vw, 580px)"
    align-center
    @closed="handleDialogClosed"
  >
    <div v-loading="state.loading" class="operate-body">
      <el-alert :title="alertTitle" :type="alertType" :closable="false" show-icon>
        <div class="alert-text">{{ alertText }}</div>
      </el-alert>

      <el-descriptions class="detail-descriptions" :column="2" border size="small">
        <el-descriptions-item label="接收端" :span="2">{{ props.endpointName || detail.webhookEndpointCode || '无' }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag size="small" effect="light" :type="currentStateTagType">{{ currentStateLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标状态">
          <el-tag size="small" effect="light" :type="targetStateTagType">{{ targetStateLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="连续失败">{{ detail.consecutiveFailures ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="累计熔断">{{ detail.openCount ?? 0 }}</el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" class="operate-form" :model="state.form" :rules="rules" label-position="top">
        <el-form-item label="操作原因" prop="reason">
          <el-input v-model="state.form.reason" type="textarea" :rows="3" maxlength="512" show-word-limit placeholder="请填写操作原因，将记录到操作日志" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button :type="confirmButtonType" :loading="state.submitting" :disabled="!state.canOperate" @click="handleSubmit">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { BIamWebhookMonitorApi } from './api/BIamWebhookMonitor.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE } from '@/shared/constants/DictionaryEnum.constant'
  import { WEBHOOK_CIRCUIT_STATE_TAG_TYPE } from './type/BIamWebhookMonitor.type'
  import type { BIamWebhookCircuitBreakerDetailResponseVo, BIamWebhookCircuitOperateType } from './type/BIamWebhookMonitor.type'

  const props = defineProps<{
    modelValue: boolean
    endpointId?: string
    endpointName?: string
    operateType: BIamWebhookCircuitOperateType
  }>()

  const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'success'): void
  }>()

  const enumStore = useDictionaryEnumStore()

  const formRef = ref<FormInstance>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value)
    }),
    loading: false,
    submitting: false,
    canOperate: false,
    detail: {} as Partial<BIamWebhookCircuitBreakerDetailResponseVo>,
    form: {
      reason: ''
    }
  })

  const detail = computed(() => state.detail)

  const isProbe = computed(() => props.operateType === 'PROBE')

  const dialogTitle = computed(() => (isProbe.value ? '熔断提前探测' : '人工重新熔断'))

  const confirmText = computed(() => (isProbe.value ? '确认探测' : '确认熔断'))

  const confirmButtonType = computed(() => (isProbe.value ? 'warning' : 'danger'))

  const alertType = computed(() => (isProbe.value ? 'warning' : 'error'))

  const alertTitle = computed(() => (isProbe.value ? '将提前放行探测请求' : '将立即暂停该接收端投递'))

  const alertText = computed(() =>
    isProbe.value
      ? '提前探测会把熔断状态由「打开」切换为「半开」，并放行少量真实投递请求。探测成功则恢复正常投递，继续失败会自动重新熔断。'
      : '人工重新熔断会把熔断状态由「半开」切换为「打开」，在熔断持续时长内暂停投递，到期后自动进入半开探测。'
  )

  const currentStateLabel = computed(() => enumStore.getEnumLabel(DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, state.detail.circuitState, '无'))

  const currentStateTagType = computed(() => WEBHOOK_CIRCUIT_STATE_TAG_TYPE[state.detail.circuitState || ''] || 'info')

  const targetStateLabel = computed(() => enumStore.getEnumLabel(DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, isProbe.value ? 'HALF_OPEN' : 'OPEN'))

  const targetStateTagType = computed(() => WEBHOOK_CIRCUIT_STATE_TAG_TYPE[isProbe.value ? 'HALF_OPEN' : 'OPEN'] || 'info')

  const expectedState = computed(() => (isProbe.value ? 'OPEN' : 'HALF_OPEN'))

  const rules: FormRules = {
    reason: [
      { required: true, message: '请填写操作原因', trigger: 'blur' },
      { max: 512, message: '操作原因长度不能超过512', trigger: 'blur' }
    ]
  }

  /** 打开弹窗时拉取最新版本号，避免使用列表中的过期数据触发乐观锁冲突 */
  const fetchData = async () => {
    if (!props.endpointId) return
    try {
      state.loading = true
      const detailData = (await BIamWebhookMonitorApi.circuitBreakerDetail({ id: props.endpointId })) || {}
      state.detail = detailData
      state.canOperate = detailData.circuitState === expectedState.value
    } catch (error) {
      console.error('获取熔断详情失败', error)
      state.canOperate = false
    } finally {
      state.loading = false
    }
  }

  const handleSubmit = async () => {
    if (!props.endpointId || state.detail.version == null) return
    try {
      await formRef.value?.validate()
    } catch {
      return
    }
    try {
      state.submitting = true
      const params = {
        webhookEndpointId: props.endpointId,
        reason: state.form.reason.trim(),
        expectedVersion: state.detail.version
      }
      if (isProbe.value) {
        await BIamWebhookMonitorApi.circuitBreakerProbe(params)
      } else {
        await BIamWebhookMonitorApi.circuitBreakerOpen(params)
      }
      ElMessage.success(`${dialogTitle.value}成功`)
      emit('success')
      state.visible = false
    } catch (error) {
      console.error(`${dialogTitle.value}失败`, error)
      // 版本冲突或状态已变更时刷新详情，便于用户基于最新状态重试
      await fetchData()
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.detail = {}
    state.form.reason = ''
    state.canOperate = false
    state.loading = false
    formRef.value?.clearValidate()
  }

  watch(
    () => props.modelValue,
    async visible => {
      if (visible) await fetchData()
    }
  )
</script>

<style scoped lang="scss">
  .operate-body > * + * {
    margin-top: 16px;
  }

  .alert-text {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
  }

  .operate-form {
    margin-bottom: -18px;
  }
</style>
