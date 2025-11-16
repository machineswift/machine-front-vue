<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑客户"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="10vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="120px" ref="formRef" v-loading="state.loading">
      <el-form-item label="客户ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>

      <el-form-item label="身份证号">
        <el-input v-model="state.identityCardNumber" disabled />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="state.formData.gender" placeholder="请选择性别">
          <el-option v-for="option in state.customerGenders" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormItemRule } from 'element-plus'
  import { reactive, watch, computed, ref } from 'vue'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { CrmCustomerApi } from '@/modules/crm/customer/api/CrmCustomer.api'
  import type { CrmCustomerUpdateRequestVo } from '@/modules/crm/customer/type/CrmCustomer.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    customerId: { type: String, required: true }
  })

  const formRef = ref()
  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'success'])

  const DEFAULT_FORM_DATA: CrmCustomerUpdateRequestVo = {
    id: '',
    name: '',
    gender: 'UNDEFINED'
  }

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    customerGenders: [] as Array<{ code: string; message: string }>,
    formData: { ...DEFAULT_FORM_DATA },
    identityCardNumber: '',
    enumInitialized: false
  })

  // 表单验证规则
  const validateName = (_rule: FormItemRule, value: string) => {
    if (value && (value.length < 2 || value.length > 32)) {
      return Promise.reject('长度在2到32个字符')
    }
    return Promise.resolve()
  }

  const rules = {
    name: [{ validator: validateName, trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
  }

  // 初始化枚举数据
  const initEnumData = () => {
    if (!state.enumInitialized) {
      state.customerGenders = enumStore.getEnumDataSync('CrmGenderEnum')
      state.enumInitialized = true
    }
  }

  // 获取客户数据
  const fetchData = async () => {
    try {
      state.loading = true
      const data = await CrmCustomerApi.detail({ id: props.customerId })
      // 设置表单数据（不包含身份证号）
      state.formData = {
        id: data.id,
        name: data.name || '',
        gender: data.gender || 'UNDEFINED'
      }
      // 单独设置身份证号用于显示
      state.identityCardNumber = data.identityCardNumber || ''
    } catch (error) {
      console.error('获取客户数据失败', error)
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

        // 如果有客户ID，则获取客户详情数据
        if (props.customerId) {
          await fetchData()
        }
      }
    },
    { immediate: false }
  )

  watch(
    () => props.customerId,
    async newCustomerId => {
      if (props.modelValue && newCustomerId) {
        await fetchData()
      }
    },
    { immediate: false }
  )

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      // 只提交表单数据，不包含身份证号
      await CrmCustomerApi.update(state.formData)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改客户失败', error)
      ElMessage.error('修改客户失败')
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }
    // 重置身份证号显示
    state.identityCardNumber = ''

    // 重置表单验证状态
    formRef.value?.resetFields()

    // 重置所有加载状态
    state.loading = false
    state.submitting = false
  }
</script>
