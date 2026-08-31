<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加用户"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="state.form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="state.form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="state.form.gender" placeholder="请选择性别">
          <el-option v-for="option in userGenders" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.form.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_GENDER } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamUserApi } from '@/modules/biam/user/api/BIamUser.api'
  import type { BIamUserCreateRequestVo } from '@/modules/biam/user/type/BIamUser.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const { options: userGenders, load: loadUserGenders } = useEnumOptions(DICT_GENDER)
  const formRef = ref<FormInstance>()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    form: {
      username: '',
      name: '',
      phone: '',
      gender: 'UNDEFINED',
      description: ''
    } as BIamUserCreateRequestVo
  })

  // 表单验证规则
  const validateUsername = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入用户名')
    if (value.length < 2 || value.length > 32) return Promise.reject('长度在2到32个字符')
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return Promise.reject('只能包含字母、数字和下划线')
    return Promise.resolve()
  }

  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入姓名')
    if (value.length < 2 || value.length > 32) return Promise.reject('长度在2到32个字符')
    return Promise.resolve()
  }

  const validatePhone = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(value)) return Promise.reject('请输入正确的手机号')
    return Promise.resolve()
  }

  const rules = {
    username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      username: '',
      name: '',
      phone: '',
      gender: 'UNDEFINED',
      description: ''
    }

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await BIamUserApi.create(state.form)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加用户失败', error)
    } finally {
      state.submitting = false
    }
  }
  onMounted(async () => {
    await loadUserGenders()
  })
</script>
