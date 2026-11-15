<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加事件分类"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-form :model="state.form" :rules="rules" label-width="90px" ref="formRef" v-loading="state.loading">
      <el-form-item label="父分类">
        <el-input v-model="state.parentCategoryName" disabled />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" placeholder="排序" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { BIamWebhookEventCategoryApi } from './api/BIamWebhookEventCategory.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo, BIamWebhookEventCategoryCreateRequestVo } from './type/BIamWebhookEventCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    parentId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const formRef = ref<FormInstance>()

  const DEFAULT_FORM: BIamWebhookEventCategoryCreateRequestVo & { sort: number } = {
    parentId: '',
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
    rootNodeId: '',
    rootNodeName: '根节点',
    parentCategoryName: '根节点',
    categoryTreeOptions: [] as BIamWebhookEventCategorySimpleTreeResponseVo[],
    form: { ...DEFAULT_FORM }
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
    ]
  }

  const loadTree = async () => {
    try {
      state.loading = true
      const response = await BIamWebhookEventCategoryApi.treeSimple()
      const root = response as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      state.categoryTreeOptions = root?.id ? [root] : []
      state.rootNodeId = root?.id || ''
      state.rootNodeName = root?.name || '根节点'

      const targetId = props.parentId?.trim() ? props.parentId : state.rootNodeId
      const targetNode = TreeDataUtil.findNode(state.categoryTreeOptions, targetId)
      state.form.parentId = targetNode?.id || state.rootNodeId
      state.parentCategoryName = targetNode?.name || state.rootNodeName
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.form = { ...DEFAULT_FORM, parentId: state.rootNodeId }
    state.parentCategoryName = state.rootNodeName
    state.categoryTreeOptions = []
    formRef.value?.resetFields()
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      await BIamWebhookEventCategoryApi.create({
        parentId: state.form.parentId,
        name: state.form.name,
        sort: state.form.sort
      })
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.parentId],
    async ([modelValue]) => {
      if (modelValue) await loadTree()
    },
    { immediate: false }
  )
</script>
