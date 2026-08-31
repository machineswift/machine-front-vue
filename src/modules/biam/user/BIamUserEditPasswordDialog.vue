<template>
  <el-dialog
    v-model="state.visible"
    title="修改密码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="36%"
    top="20vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="80px" ref="formRef">
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="state.form.newPassword" type="password" placeholder="请输入新密码" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="state.form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:UPDATE_PASSWORD']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormItemRule } from 'element-plus'
  import { BIamUserApi } from '@/modules/biam/user/api/BIamUser.api'
  import type { BIamUserUpdatePasswordRequestVo } from '@/modules/biam/user/type/BIamUser.type'

  const props = defineProps<{
    modelValue: boolean
    userId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    form: {
      newPassword: '',
      confirmPassword: ''
    }
  })

  // 密码验证规则
  const validatePassword = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入密码')
    if (value.length < 6 || value.length > 32) return Promise.reject('长度在6到32个字符')
    return Promise.resolve()
  }

  // 确认密码验证规则
  const validateConfirmPassword = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请再次输入密码')
    if (value !== state.form.newPassword) return Promise.reject('两次输入的密码不一致')
    return Promise.resolve()
  }

  // 表单验证规则
  const rules = {
    newPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      const params: BIamUserUpdatePasswordRequestVo = {
        id: props.userId,
        newPassword: state.form.newPassword
      }

      await BIamUserApi.updatePassword(params)
      ElMessage.success('密码修改成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改密码失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    // 彻底清空密码表单数据
    state.form = {
      newPassword: '',
      confirmPassword: ''
    }

    //重置表单验证状态
    formRef.value?.resetFields()

    state.submitting = false

    //除可能的错误提示
    formRef.value?.clearValidate()
  }
</script>
