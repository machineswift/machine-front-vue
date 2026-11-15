<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="新增Webhook接收端"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <el-form
      :model="state.form"
      :rules="rules"
      label-width="110px"
      ref="formRef"
      v-loading="state.loading"
      class="dialog-form"
      :style="{ height: `${dialogBodyHeight}px` }"
    >
      <el-form-item label="接收端名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入接收端名称" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="关联客户端" prop="clientId">
        <el-select v-model="state.form.clientId" placeholder="请选择关联 OAuth2 客户端" filterable style="width: 100%">
          <el-option v-for="option in clientOptions" :key="option.clientId" :label="option.clientName" :value="option.clientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="接收地址" prop="endpointUrl">
        <el-input v-model="state.form.endpointUrl" placeholder="请输入 Webhook 接收地址，如 https://example.com/webhook" />
      </el-form-item>
      <el-form-item label="签名密钥" prop="endpointSecret">
        <el-input v-model="state.form.endpointSecret" placeholder="用于签名校验，长度需大于等于64位">
          <template #append>
            <el-button :icon="RefreshRight" @click="handleGenerateSecret">生成</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="重试策略">
        <div class="retry-policy">
          <div class="retry-policy-chain">
            <template v-for="(interval, index) in WEBHOOK_RETRY_INTERVALS" :key="index">
              <el-tag size="small" type="primary" effect="plain">{{ formatRetryInterval(interval) }}</el-tag>
              <el-icon v-if="index < WEBHOOK_RETRY_INTERVALS.length - 1" class="retry-policy-arrow"><Right /></el-icon>
            </template>
          </div>
          <div class="retry-policy-summary">共 {{ WEBHOOK_RETRY_INTERVALS.length }} 次重试，全部失败后停止投递（系统固定策略，不可修改）</div>
        </div>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="state.form.description" type="textarea" :rows="3" placeholder="请输入描述" maxlength="255" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:CREATE']">确定</el-button>
    </template>
  </el-dialog>

  <BIamWebhookEndpointSecretDialog v-model="state.secretVisible" :endpoint-code="state.secret.endpointCode" :endpoint-secret="state.secret.endpointSecret" />
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { RefreshRight, Right } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import BIamWebhookEndpointSecretDialog from './BIamWebhookEndpointSecretDialog.vue'
  import { BIamWebhookEndpointApi } from './api/BIamWebhookEndpoint.api'
  import { generateClientSecret, STRONG_SECRET_PATTERN } from '@/shared/utils/Secret.util'
  import { formatRetryInterval, WEBHOOK_RETRY_INTERVALS } from './type/BIamWebhookEndpoint.type'
  import type { BIamWebhookEndpointClientOption } from './type/BIamWebhookEndpoint.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    clientOptions: { type: Array as () => BIamWebhookEndpointClientOption[], default: () => [] }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const formRef = ref<FormInstance>()

  interface FormModel {
    name: string
    clientId: string
    endpointUrl: string
    endpointSecret: string
    description: string
  }

  const DEFAULT_FORM: FormModel = {
    name: '',
    clientId: '',
    endpointUrl: '',
    endpointSecret: '',
    description: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    secretVisible: false,
    secret: {
      endpointCode: '',
      endpointSecret: ''
    },
    form: { ...DEFAULT_FORM }
  })

  const { height: windowHeight } = useWindowSize()

  const dialogBodyHeight = computed(() => Math.min(Math.max(windowHeight.value - 250, 380), 560))

  const validateEndpointUrl = (_rule: unknown, value: string, callback: (error?: Error) => void): void => {
    if (!value || !value.trim()) {
      callback(new Error('请输入接收地址'))
      return
    }
    if (!/^https?:\/\/\S+$/i.test(value.trim())) {
      callback(new Error('接收地址需以 http:// 或 https:// 开头'))
      return
    }
    callback()
  }

  const validateSecret = (_rule: unknown, value: string, callback: (error?: Error) => void): void => {
    if (!value) {
      callback(new Error('请输入签名密钥'))
      return
    }
    if (!STRONG_SECRET_PATTERN.test(value)) {
      callback(new Error('签名密钥长度需大于等于64位'))
      return
    }
    callback()
  }

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入接收端名称', trigger: 'blur' },
      { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
    ],
    clientId: [{ required: true, message: '请选择关联客户端', trigger: 'change' }],
    endpointUrl: [{ validator: validateEndpointUrl, trigger: 'blur' }],
    endpointSecret: [{ validator: validateSecret, trigger: 'blur' }]
  }

  const handleGenerateSecret = () => {
    state.form.endpointSecret = generateClientSecret()
  }

  const openSecretDialog = (endpointCode: string, endpointSecret: string): void => {
    state.secret.endpointCode = endpointCode
    state.secret.endpointSecret = endpointSecret
    state.secretVisible = true
  }

  const fetchEndpointCode = async (id: string): Promise<string> => {
    try {
      const detail = await BIamWebhookEndpointApi.detail({ id })
      return detail.code || ''
    } catch (error) {
      console.error('获取接收端编码失败', error)
      return ''
    }
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      const endpointSecret = state.form.endpointSecret
      const res = await BIamWebhookEndpointApi.create({
        name: state.form.name.trim(),
        clientId: state.form.clientId,
        endpointUrl: state.form.endpointUrl.trim(),
        endpointSecret,
        retryPolicy: [...WEBHOOK_RETRY_INTERVALS],
        description: state.form.description.trim()
      })
      // 先取出密钥再关闭表单，避免被 handleDialogClosed 清空
      state.dialogVisible = false
      emit('success')
      const endpointCode = await fetchEndpointCode(res.id)
      // 密钥仅此一次可见，创建成功后引导用户复制保存
      openSecretDialog(endpointCode, endpointSecret)
    } catch (error) {
      console.error('新增接收端失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.form = { ...DEFAULT_FORM }
    formRef.value?.resetFields()
    state.loading = false
    state.submitting = false
  }

  // 凭据弹窗关闭后清空，避免组件内残留敏感信息
  watch(
    () => state.secretVisible,
    visible => {
      if (!visible) state.secret = { endpointCode: '', endpointSecret: '' }
    }
  )

  watch(
    () => props.modelValue,
    modelValue => {
      // 新增时默认带入生成的签名密钥，避免用户手填出错
      if (modelValue && !state.form.endpointSecret) state.form.endpointSecret = generateClientSecret()
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .retry-policy {
    width: 100%;
  }

  .retry-policy-chain {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .retry-policy-arrow {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  .retry-policy-summary {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
</style>
