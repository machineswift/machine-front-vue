<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="state.code" disabled />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagCategoryUpdateRequestVo } from '@/modules/data/tag/type/DataTagCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' }
  })

  const formRef = ref<FormInstance>()
  const emit = defineEmits(['update:modelValue', 'close', 'success'])

  const DEFAULT_FORM_DATA: DataTagCategoryUpdateRequestVo = {
    id: '',
    name: '',
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
    formData: { ...DEFAULT_FORM_DATA },
    code: '' // 用于显示编码，但不参与提交
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 32, message: '长度在1到32个字符', trigger: 'blur' }
    ],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  // 获取分类数据
  const fetchData = async () => {
    try {
      state.loading = true
      const data = await DataTagCategoryApi.detail({ id: props.categoryId })
      state.formData = {
        id: data.id,
        name: data.name,
        description: data.description || ''
      }
      state.code = data.code || '' // 保存编码用于显示
    } catch (error) {
      console.error('获取分类数据失败', error)
    } finally {
      state.loading = false
    }
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagCategoryApi.update(state.formData)
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
    //重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }
    state.code = ''

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置所有加载状态
    state.loading = false
    state.submitting = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
