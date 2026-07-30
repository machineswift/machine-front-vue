<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加标签"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="分类" prop="categoryId">
        <el-tree-select
          v-model="state.form.categoryId"
          :data="state.categoryTreeOptions"
          :props="categoryProps"
          placeholder="请选择分类"
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>

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
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagCreateRequestVo } from '@/modules/data/tag/type/DataTag.type'
  import type { DataTagCategoryTreeSimpleOutputDto } from '@/modules/data/tag/type/DataTagCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    type: { type: String, default: null }
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
    loading: false,
    categoryTreeOptions: [] as DataTagCategoryTreeSimpleOutputDto[],
    form: {
      categoryId: '',
      code: '',
      name: '',
      sort: 0,
      description: ''
    } as DataTagCreateRequestVo
  })

  const categoryProps = {
    value: 'id',
    label: 'name',
    children: 'children'
  }

  // 表单验证规则
  const validateCategoryId = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请选择分类')
    return Promise.resolve()
  }

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
    categoryId: [{ required: true, validator: validateCategoryId, trigger: 'blur' }],
    code: [{ required: true, validator: validateCode, trigger: 'blur' }],
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    sort: [{ required: true, validator: validateSort, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  // 加载分类树
  const loadCategoryTree = async () => {
    if (!props.type) return
    try {
      state.loading = true
      const response = await DataTagCategoryApi.treeSimple({ type: props.type })
      // treeSimple 返回的是根节点，需要获取其 children 或包装成数组
      state.categoryTreeOptions = response.children && response.children.length > 0 ? response.children : response.id ? [response] : []
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      categoryId: '',
      code: '',
      name: '',
      sort: 0,
      description: ''
    }

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
    state.loading = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagApi.create(state.form)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加标签失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和类型变化
  watch(
    [() => props.modelValue, () => props.type],
    async ([modelValue, type]) => {
      if (modelValue && type) {
        await loadCategoryTree()
      }
    },
    { immediate: false }
  )
</script>
