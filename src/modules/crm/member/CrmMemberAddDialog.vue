<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加会员"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="10vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="120px" ref="formRef">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="state.form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="state.form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="state.form.gender" placeholder="请选择性别">
          <el-option v-for="option in state.memberGenders" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="出生年份" prop="birthYear">
        <el-input-number v-model="state.form.birthYear" :min="1900" :max="new Date().getFullYear()" placeholder="请输入出生年份" />
      </el-form-item>

      <el-form-item label="出生月份" prop="birthMonth">
        <el-input-number v-model="state.form.birthMonth" :min="1" :max="12" placeholder="请输入出生月份" />
      </el-form-item>

      <el-form-item label="出生日期" prop="birthDay">
        <el-input-number v-model="state.form.birthDay" :min="1" :max="31" placeholder="请输入出生日期" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['CRM:CUSTOMER:MEMBER:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { CrmMemberApi } from '@/modules/crm/member/api/CrmMember.api'
  import type { CrmMemberCreateRequestVo } from '@/modules/crm/member/type/CrmMember.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const enumStore = useDictionaryEnumStore()
  const formRef = ref<FormInstance>()

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    memberGenders: [] as Array<{ code: string; message: string }>,
    form: {
      email: '',
      phone: '',
      name: '',
      gender: 'UNDEFINED',
      birthYear: undefined as number | undefined,
      birthMonth: undefined as number | undefined,
      birthDay: undefined as number | undefined
    } as CrmMemberCreateRequestVo,
    initialized: false
  })

  // 表单验证规则
  const validateEmail = (_rule: FormItemRule, value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return Promise.reject('请输入正确的邮箱格式')
    }
    return Promise.resolve()
  }

  const validatePhone = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(value)) return Promise.reject('请输入正确的手机号格式')
    return Promise.resolve()
  }

  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入姓名')
    if (value.length < 2 || value.length > 32) {
      return Promise.reject('长度在2到32个字符')
    }
    return Promise.resolve()
  }

  const validateBirthYear = (_rule: FormItemRule, value: number) => {
    if (value && (value < 1900 || value > new Date().getFullYear())) {
      return Promise.reject(`出生年份应在1900-${new Date().getFullYear()}之间`)
    }
    return Promise.resolve()
  }

  const validateBirthMonth = (_rule: FormItemRule, value: number) => {
    if (value && (value < 1 || value > 12)) {
      return Promise.reject('出生月份应在1-12之间')
    }
    return Promise.resolve()
  }

  const validateBirthDay = (_rule: FormItemRule, value: number) => {
    if (value && (value < 1 || value > 31)) {
      return Promise.reject('出生日期应在1-31之间')
    }
    return Promise.resolve()
  }

  const rules = {
    email: [{ validator: validateEmail, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birthYear: [{ validator: validateBirthYear, trigger: 'blur' }],
    birthMonth: [{ validator: validateBirthMonth, trigger: 'blur' }],
    birthDay: [{ validator: validateBirthDay, trigger: 'blur' }]
  }

  // 初始化枚举数据
  const initEnumData = () => {
    if (!state.initialized) {
      state.memberGenders = enumStore.getEnumDataSync('CrmGenderEnum')
      state.initialized = true
    }
  }

  // 监听对话框显示状态，在打开时初始化枚举数据
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        initEnumData()
      }
    },
    { immediate: false }
  )

  const handleDialogClosed = () => {
    // 重置表单数据
    state.form = {
      email: '',
      phone: '',
      name: '',
      gender: 'UNDEFINED',
      birthYear: undefined,
      birthMonth: undefined,
      birthDay: undefined
    }

    // 重置表单验证状态
    formRef.value?.resetFields()

    // 重置提交状态
    state.submitting = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await CrmMemberApi.create(state.form)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加会员失败', error)
    } finally {
      state.submitting = false
    }
  }
</script>
