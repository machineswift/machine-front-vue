<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑标签"
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
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:TAG:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import type { DataTagUpdateRequestVo } from '@/modules/data/tag/type/DataTag.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    tagId: { type: String, default: '' }
  })

  const formRef = ref<FormInstance>()
  const emit = defineEmits(['update:modelValue', 'close', 'success'])

  const DEFAULT_FORM_DATA: DataTagUpdateRequestVo = {
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
    code: '', // 编码字段，用于显示（只读）
    formData: { ...DEFAULT_FORM_DATA }
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 32, message: '长度在1到32个字符', trigger: 'blur' }
    ],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  // 获取标签数据
  const fetchData = async () => {
    try {
      state.loading = true
      const data = await DataTagApi.detail({ id: props.tagId })
      state.code = data.code || '' // 设置编码用于显示
      state.formData = {
        id: data.id,
        name: data.name,
        description: data.description || ''
      }
    } catch (error) {
      console.error('获取标签数据失败', error)
    } finally {
      state.loading = false
    }
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagApi.update(state.formData)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改标签失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }
    state.code = '' // 重置编码

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置所有加载状态
    state.loading = false
    state.submitting = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.tagId],
    async ([modelValue, tagId]) => {
      if (modelValue && tagId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
