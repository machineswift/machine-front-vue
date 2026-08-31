<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑会员"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="10vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="120px" ref="formRef" v-loading="state.loading">
      <el-form-item label="会员ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="state.email" disabled />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="state.phone" disabled />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="state.formData.gender" placeholder="请选择性别">
          <el-option v-for="option in memberGenders" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="出生年份" prop="birthYear">
        <el-input-number v-model="state.formData.birthYear" :min="1900" :max="new Date().getFullYear()" placeholder="请输入出生年份" />
      </el-form-item>

      <el-form-item label="出生月份" prop="birthMonth">
        <el-input-number v-model="state.formData.birthMonth" :min="1" :max="12" placeholder="请输入出生月份" />
      </el-form-item>

      <el-form-item label="出生日期" prop="birthDay">
        <el-input-number v-model="state.formData.birthDay" :min="1" :max="31" placeholder="请输入出生日期" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:CRM:CUSTOMER:MEMBER:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormItemRule } from 'element-plus'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_GENDER } from '@/shared/constants/DictionaryEnum.constant'
  import { CrmMemberApi } from '@/modules/crm/member/api/CrmMember.api'
  import type { CrmMemberUpdateRequestVo } from '@/modules/crm/member/type/CrmMember.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    memberId: { type: String, required: true }
  })

  const formRef = ref()
  const emit = defineEmits(['update:modelValue', 'success'])

  // 性别枚举选项
  const { options: memberGenders, load: loadGenderOptions } = useEnumOptions(DICT_GENDER)

  const DEFAULT_FORM_DATA: CrmMemberUpdateRequestVo = {
    id: '',
    name: '',
    gender: 'UNDEFINED',
    birthYear: undefined,
    birthMonth: undefined,
    birthDay: undefined
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: { ...DEFAULT_FORM_DATA },
    email: '',
    phone: ''
  })

  // 表单验证规则
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
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birthYear: [{ validator: validateBirthYear, trigger: 'blur' }],
    birthMonth: [{ validator: validateBirthMonth, trigger: 'blur' }],
    birthDay: [{ validator: validateBirthDay, trigger: 'blur' }]
  }

  const initEnumData = async () => {
    await loadGenderOptions()
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const data = await CrmMemberApi.detail({ id: props.memberId })
      // 设置表单数据
      state.formData = {
        id: data.id,
        name: data.name || '',
        gender: data.gender || 'UNDEFINED',
        birthYear: data.birthYear,
        birthMonth: data.birthMonth,
        birthDay: data.birthDay
      }
      // 单独设置邮箱和手机号用于显示
      state.email = data.email || ''
      state.phone = data.phone || ''
    } catch (error) {
      console.error('获取会员数据失败', error)
    } finally {
      state.loading = false
    }
  }

  // 监听对话框打开状态
  watch(
    () => props.modelValue,
    async newValue => {
      if (newValue) {
        // 对话框打开时初始化枚举数据
        initEnumData()

        // 如果有会员ID，则获取会员详情数据
        if (props.memberId) {
          await fetchData()
        }
      }
    },
    { immediate: false }
  )

  watch(
    () => props.memberId,
    async newMemberId => {
      if (props.modelValue && newMemberId) {
        await fetchData()
      }
    },
    { immediate: false }
  )

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await CrmMemberApi.update(state.formData)
      ElMessage.success('更新成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('更新会员失败', error)
      ElMessage.error('更新会员失败')
    } finally {
      state.submitting = false
    }
  }

  // 对话框关闭时重置表单
  const handleDialogClosed = () => {
    state.formData = { ...DEFAULT_FORM_DATA }
    state.email = ''
    state.phone = ''
    state.submitting = false
    state.loading = false
  }
</script>
