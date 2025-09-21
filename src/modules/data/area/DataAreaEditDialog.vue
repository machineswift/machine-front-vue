<template>
  <el-dialog
    v-model="state.visible"
    title="编辑区域"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
          <el-form-item label="区域名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入区域名称" />
          </el-form-item>

          <el-form-item label="区域编码" prop="code">
            <el-input v-model="state.formData.code" placeholder="请输入区域编码" />
          </el-form-item>

          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="state.formData.sort" :min="0" />
          </el-form-item>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:AREA:UPDATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import type { DataAreaUpdateRequestVo, DataAreaExpandTreeResponseVo } from '@/modules/data/types'

  const props = defineProps<{
    modelValue: boolean
    areaData: DataAreaExpandTreeResponseVo
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: {
      id: '',
      code: '',
      name: '',
      sort: 0
    } as DataAreaUpdateRequestVo
  })

  // 表单验证规则
  const rules = {
    name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入区域编码', trigger: 'blur' }]
  }

  const handleDialogClosed = () => {
    // 重置表单数据（保留id字段）
    state.formData = {
      id: '',
      code: '',
      name: '',
      sort: 0
    }

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    //重置所有加载状态
    state.loading = false
    state.submitting = false
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      await DataAreaApi.update({
        id: state.formData.id,
        code: state.formData.code,
        name: state.formData.name,
        sort: state.formData.sort
      })

      ElMessage.success('更新区域成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('更新区域失败', error)
      ElMessage.error('更新区域失败')
    } finally {
      state.submitting = false
    }
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.areaData) {
      state.formData = {
        id: props.areaData.id,
        code: props.areaData.code,
        name: props.areaData.name,
        sort: props.areaData.sort
      }
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.areaData],
    async ([modelValue, areaData]) => {
      if (modelValue && areaData) {
        await initFormData()
      }
    },
    { immediate: false }
  )
</script>
