<template>
  <el-dialog
    v-model="state.visible"
    title="修改手机号"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="36%"
    top="20vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="80px" ref="formRef">
      <el-form-item label="新手机号" prop="phone">
        <el-input v-model="state.form.phone" placeholder="请输入新手机号" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_PHONE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormItemRule } from 'element-plus'
  import { IamUserApi } from '@/modules/iam/user/api/IamUser.api'
  import type { IamUserUpdatePhoneRequestVo } from '@/modules/iam/types'

  const props = defineProps<{
    modelValue: boolean
    userId: string
    currentPhone?: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    form: {
      id: props.userId,
      phone: props.currentPhone || ''
    } as IamUserUpdatePhoneRequestVo
  })

  // 手机号验证规则
  const validatePhone = async (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(value)) return Promise.reject('请输入正确的手机号')
    return Promise.resolve()
  }

  // 表单验证规则
  const rules = {
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }]
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await IamUserApi.updatePhone({
        id: props.userId,
        phone: state.form.phone
      })

      ElMessage.success('手机号修改成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改手机号失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      id: '',
      phone: ''
    }

    //彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    //重置提交状态
    state.submitting = false
  }
</script>
