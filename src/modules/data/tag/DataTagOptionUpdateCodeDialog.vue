<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改编码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="500px"
    top="20vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="选项名称:">
        <el-input v-model="state.optionName" disabled />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="state.form.code" placeholder="请输入编码" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG_OPTION:UPDATE_CODE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagOptionApi } from '@/modules/data/tag/api/DataTagOption.api'
  import type { DataTagOptionUpdateCodeRequestVo } from '@/modules/data/tag/type/DataTagOption.type'
  import type { DataTagOptionDetailResponseVo } from '@/modules/data/tag/type/DataTagOption.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    optionId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    optionName: '',
    form: {
      id: '',
      code: ''
    } as DataTagOptionUpdateCodeRequestVo
  })

  // 表单验证规则
  const validateCode = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入编码')
    if (value.length < 1 || value.length > 32) return Promise.reject('长度在1到32个字符')
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return Promise.reject('只能包含字母、数字和下划线')
    return Promise.resolve()
  }

  const rules = {
    code: [{ required: true, validator: validateCode, trigger: 'blur' }]
  }

  // 加载选项数据
  const loadOptionData = async () => {
    if (!props.optionId) return
    try {
      state.loading = true
      const data: DataTagOptionDetailResponseVo = await DataTagOptionApi.detail({ id: props.optionId })
      state.optionName = data.name || ''
      state.form.id = data.id
      state.form.code = data.code || ''
    } catch (error) {
      console.error('加载选项数据失败', error)
      ElMessage.error('加载选项数据失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      id: '',
      code: ''
    }
    state.optionName = ''

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
    state.loading = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagOptionApi.updateCode(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改编码失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和选项ID变化
  watch(
    [() => props.modelValue, () => props.optionId],
    async ([modelValue, optionId]) => {
      if (modelValue && optionId) {
        await loadOptionData()
      }
    },
    { immediate: false }
  )
</script>
