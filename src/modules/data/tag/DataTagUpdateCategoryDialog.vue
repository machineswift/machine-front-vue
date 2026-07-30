<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="标签名称:">
        <el-input v-model="state.tagName" disabled />
      </el-form-item>

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
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG:UPDATE_CATEGORY']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagUpdateCategoryRequestVo } from '@/modules/data/tag/type/DataTag.type'
  import type { DataTagDetailResponseVo } from '@/modules/data/tag/type/DataTag.type'
  import type { DataTagCategoryTreeSimpleOutputDto } from '@/modules/data/tag/type/DataTagCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    tagId: { type: String, default: '' },
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
    tagName: '',
    categoryTreeOptions: [] as DataTagCategoryTreeSimpleOutputDto[],
    form: {
      id: '',
      categoryId: ''
    } as DataTagUpdateCategoryRequestVo
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

  const rules = {
    categoryId: [{ required: true, validator: validateCategoryId, trigger: 'blur' }]
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

  // 加载标签数据
  const loadTagData = async () => {
    if (!props.tagId) return
    try {
      state.loading = true
      const data: DataTagDetailResponseVo = await DataTagApi.detail({ id: props.tagId })
      state.tagName = data.name || ''
      state.form.id = data.id
      state.form.categoryId = data.categoryId || ''
    } catch (error) {
      console.error('加载标签数据失败', error)
      ElMessage.error('加载标签数据失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      id: '',
      categoryId: ''
    }
    state.tagName = ''
    state.categoryTreeOptions = []

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

      await DataTagApi.updateCategory(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和标签ID、类型变化
  watch(
    [() => props.modelValue, () => props.tagId, () => props.type],
    async ([modelValue, tagId, type]) => {
      if (modelValue && tagId && type) {
        await Promise.all([loadTagData(), loadCategoryTree()])
      }
    },
    { immediate: false }
  )
</script>
