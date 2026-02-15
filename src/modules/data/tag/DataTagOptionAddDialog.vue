<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加选项"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="编码" prop="code">
        <el-input v-model="state.form.code" placeholder="请输入编码" />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入名称" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" placeholder="请输入排序" style="width: 100%" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.form.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_OPTION:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagOptionApi } from '@/modules/data/tag/api/DataTagOption.api'
  import type { DataTagOptionCreateRequestVo } from '@/modules/data/tag/type/DataTagOption.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    tagId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    form: {
      tagId: '',
      code: '',
      name: '',
      sort: 0,
      description: ''
    } as DataTagOptionCreateRequestVo
  })

  // 表单验证规则
  const validateCode = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入编码')
    if (value.length < 1 || value.length > 32) return Promise.reject('长度在1到32个字符')
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return Promise.reject('只能包含字母、数字和下划线')
    return Promise.resolve()
  }

  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入名称')
    if (value.length < 1 || value.length > 32) return Promise.reject('长度在1到32个字符')
    return Promise.resolve()
  }

  const validateSort = (_rule: FormItemRule, value: number) => {
    if (value === null || value === undefined) return Promise.reject('请输入排序')
    if (value < 0 || value > 999999) return Promise.reject('排序值在0到999999之间')
    return Promise.resolve()
  }

  const rules = {
    code: [{ required: true, validator: validateCode, trigger: 'blur' }],
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    sort: [{ required: true, validator: validateSort, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      tagId: '',
      code: '',
      name: '',
      sort: 0,
      description: ''
    }

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      const formData = {
        ...state.form,
        tagId: props.tagId
      }

      await DataTagOptionApi.create(formData)
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加选项失败', error)
    } finally {
      state.submitting = false
    }
  }
</script>
