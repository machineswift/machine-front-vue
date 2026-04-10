<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑素材分类"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="480px"
  >
    <el-form :model="state.formData" :rules="rules" label-width="80px" ref="formRef" v-loading="state.loading">
      <el-form-item label="ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="state.code" disabled />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="999999" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type { DataMaterialCategoryUpdateRequestVo, DataMaterialCategoryDetailResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' }
  })

  const formRef = ref<FormInstance>()
  const emit = defineEmits(['update:modelValue', 'success'])

  const DEFAULT_FORM: DataMaterialCategoryUpdateRequestVo & { sort?: number } = {
    id: '',
    name: '',
    sort: 0
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: { ...DEFAULT_FORM },
    code: ''
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
    ]
  }

  const fetchData = async () => {
    if (!props.categoryId) return
    try {
      state.loading = true
      const data: DataMaterialCategoryDetailResponseVo = await DataMaterialCategoryApi.detail({ id: props.categoryId })
      state.formData = {
        id: data.id!,
        name: data.name || '',
        sort: data.sort ?? 0
      }
      state.code = data.code || ''
    } catch (error) {
      console.error('获取分类失败', error)
    } finally {
      state.loading = false
    }
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      await DataMaterialCategoryApi.update(state.formData)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = { ...DEFAULT_FORM }
    state.code = ''
    formRef.value?.resetFields()
    state.loading = false
    state.submitting = false
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) await fetchData()
    },
    { immediate: false }
  )
</script>
