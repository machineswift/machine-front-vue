<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加品牌"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入品牌名称" />
      </el-form-item>

      <el-form-item label="品牌LOGO" prop="logoMaterialId" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">
        <DataBrandLogoUpload v-model:modelMaterialId="state.formData.logoMaterialId" v-model:modelImageUrl="state.formData.logoUrl" />
      </el-form-item>

      <el-form-item label="品牌描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="6" placeholder="请输入品牌描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormItemRule } from 'element-plus'
  import type { DataBrandCreateRequestVo } from '@/modules/data/types'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import DataBrandLogoUpload from '@/modules/data/brand/DataBrandLogoUpload.vue'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    formData: {
      name: '',
      logoMaterialId: '',
      logoUrl: '',
      description: ''
    } as DataBrandCreateRequestVo
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

  const validateLogo = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请上传品牌LOGO')
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    logoMaterialId: [{ required: true, validator: validateLogo, trigger: 'change' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = {
      name: '',
      logoMaterialId: '',
      logoUrl: '',
      description: ''
    }

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    // 重置提交状态
    state.submitting = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataBrandApi.create({
        name: state.formData.name,
        logoMaterialId: state.formData.logoMaterialId,
        description: state.formData.description
      })

      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加品牌失败', error)
    } finally {
      state.submitting = false
    }
  }
</script>
