<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑品牌"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="品牌ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>

      <el-form-item label="品牌编码" prop="code">
        <el-input v-model="state.formData.code" disabled />
      </el-form-item>

      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入品牌名称" />
      </el-form-item>

      <el-form-item label="品牌LOGO" prop="logoMaterialId" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:UPDATE']">
        <DataBrandLogoUpload v-model:modelMaterialId="state.formData.logoMaterialId" v-model:modelImageUrl="state.formData.logoUrl" />
      </el-form-item>

      <el-form-item label="品牌描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="6" placeholder="请输入品牌描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import type { FormItemRule } from 'element-plus'
  import type { DataBrandUpdateRequestVo } from '@/modules/data/types'
  import DataBrandLogoUpload from '@/modules/data/brand/DataBrandLogoUpload.vue'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'close', 'success'])
  const formRef = ref()

  const DEFAULT_FORM_DATA: DataBrandUpdateRequestVo = {
    id: '',
    code: '',
    name: '',
    logoMaterialId: '',
    logoUrl: '',
    description: ''
  }

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: { ...DEFAULT_FORM_DATA }
  })

  // 表单验证规则
  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入品牌名称')
    if (value.length < 2 || value.length > 32) {
      return Promise.reject('长度在2到32个字符')
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject('只能包含中文、英文和数字')
    }
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  // 获取详情
  const fetchDetail = async () => {
    try {
      state.loading = true
      const response = await DataBrandApi.detail({ id: props.brandId })
      state.formData = {
        id: response.id,
        code: response.code,
        name: response.name,
        logoMaterialId: response.logoMaterialId || '',
        logoUrl: response.logoUrl || '',
        description: response.description || ''
      }
    } catch (error) {
      console.error('获取品牌详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    // 重置所有加载状态
    state.loading = false
    state.submitting = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataBrandApi.update({
        id: state.formData.id,
        name: state.formData.name,
        logoMaterialId: state.formData.logoMaterialId,
        description: state.formData.description
      })

      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改品牌失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.brandId],
    async ([modelValue, brandId]) => {
      if (modelValue && brandId) {
        await fetchDetail()
      }
    },
    { immediate: false }
  )
</script>
