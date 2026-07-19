<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加客户"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="10vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="120px" ref="formRef">
      <el-form-item label="身份证号" prop="identityCardNumber">
        <el-input v-model="state.form.identityCardNumber" placeholder="请输入身份证号" />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="state.form.gender" placeholder="请选择性别">
          <el-option v-for="option in state.customerGenders" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { CrmCustomerApi } from '@/modules/crm/customer/api/CrmCustomer.api'
  import type { CrmCustomerCreateRequestVo } from '@/modules/crm/customer/type/CrmCustomer.type'

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
    customerGenders: [] as Array<{ code: string; message: string }>,
    form: {
      identityCardNumber: '',
      name: '',
      gender: 'UNDEFINED'
    } as CrmCustomerCreateRequestVo,
    initialized: false
  })

  // 表单验证规则
  const validateIdentityCardNumber = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入身份证号')
    if (value.length !== 18) return Promise.reject('身份证号必须是18位')
    // 简单的身份证号格式验证
    if (!/^\d{17}[\dXx]$/.test(value)) return Promise.reject('请输入正确的身份证号格式')
    return Promise.resolve()
  }

  const validateName = (_rule: FormItemRule, value: string) => {
    if (value && (value.length < 2 || value.length > 32)) {
      return Promise.reject('长度在2到32个字符')
    }
    return Promise.resolve()
  }

  const rules = {
    identityCardNumber: [{ required: true, validator: validateIdentityCardNumber, trigger: 'blur' }],
    name: [{ validator: validateName, trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
  }

  // 初始化枚举数据
  const initEnumData = () => {
    if (!state.initialized) {
      state.customerGenders = enumStore.getEnumDataSync('GenderEnum')
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
      identityCardNumber: '',
      name: '',
      gender: 'UNDEFINED'
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

      await CrmCustomerApi.create(state.form)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加客户失败', error)
      ElMessage.error('添加客户失败')
    } finally {
      state.submitting = false
    }
  }
</script>
