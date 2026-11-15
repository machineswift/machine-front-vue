<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑Webhook事件"
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
      <el-form-item label="事件分类" prop="categoryId">
        <BIamWebhookEventCategoryPicker v-model="state.form.categoryId" />
      </el-form-item>
      <el-form-item label="事件编码" prop="code">
        <el-input v-model="state.form.code" placeholder="与平台事件编码保持一致，如 IAM_USER_CREATE" />
      </el-form-item>
      <el-form-item label="事件名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入事件名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="载荷结构" prop="payloadSchema">
        <JsonEditor v-model="state.form.payloadSchema" height="180px" placeholder="请输入事件载荷结构定义（JSON）" />
      </el-form-item>
      <el-form-item label="事件描述" prop="description">
        <el-input v-model="state.form.description" type="textarea" :rows="3" placeholder="请输入事件描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import JsonEditor from '@/shared/components/JsonEditor.vue'
  import { BIamWebhookEventApi } from './api/BIamWebhookEvent.api'
  import BIamWebhookEventCategoryPicker from './BIamWebhookEventCategoryPicker.vue'
  import { formatJsonText, parseJsonText, validateJsonObject } from '@/shared/utils/Json.util'
  import type { BIamWebhookEventUpdateRequestVo } from './type/BIamWebhookEvent.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    eventId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const formRef = ref<FormInstance>()

  type FormModel = Omit<BIamWebhookEventUpdateRequestVo, 'payloadSchema'> & { payloadSchema: string; sort: number }

  const DEFAULT_FORM: FormModel = {
    id: '',
    categoryId: '',
    code: '',
    name: '',
    sort: 0,
    payloadSchema: '',
    description: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    form: { ...DEFAULT_FORM }
  })

  const { height: windowHeight } = useWindowSize()

  const dialogBodyHeight = computed(() => Math.min(Math.max(windowHeight.value - 250, 380), 560))

  const rules: FormRules = {
    categoryId: [{ required: true, message: '请选择事件分类', trigger: 'change' }],
    code: [
      { required: true, message: '请输入事件编码', trigger: 'blur' },
      { min: 1, max: 128, message: '长度在1到128个字符', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入事件名称', trigger: 'blur' },
      { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
    ],
    payloadSchema: [{ validator: validateJsonObject, trigger: 'blur' }]
  }

  const fetchData = async () => {
    if (!props.eventId) return
    try {
      state.loading = true
      const data = await BIamWebhookEventApi.detail({ id: props.eventId })
      state.form = {
        id: data.id,
        categoryId: data.categoryId || '',
        code: data.code || '',
        name: data.name || '',
        sort: data.sort ?? 0,
        payloadSchema: formatJsonText(data.payloadSchema),
        description: data.description || ''
      }
    } catch (error) {
      console.error('获取事件详情失败', error)
      ElMessage.error('获取事件详情失败')
    } finally {
      state.loading = false
    }
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      await BIamWebhookEventApi.update({
        id: state.form.id,
        categoryId: state.form.categoryId,
        code: state.form.code,
        name: state.form.name,
        sort: state.form.sort,
        payloadSchema: parseJsonText(state.form.payloadSchema),
        description: state.form.description
      })
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改事件失败', error)
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

  watch(
    [() => props.modelValue, () => props.eventId],
    async ([modelValue, eventId]) => {
      if (modelValue && eventId) await fetchData()
    },
    { immediate: false }
  )
</script>
