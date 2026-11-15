<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="移动事件分类"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-form :model="state.form" label-width="100px" v-loading="state.loading">
      <el-form-item label="当前分类:">
        <el-input v-model="state.categoryName" disabled />
      </el-form-item>
      <el-form-item label="新父分类:">
        <TreePickerPanel
          v-model="state.form.parentId"
          :roots="state.categoryTreeOptions"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前分类或其下级分类作为父分类"
          :icon="FolderOpened"
          placeholder="输入分类名称或编码搜索"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        :disabled="!state.form.parentId"
        v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import { BIamWebhookEventCategoryApi } from './api/BIamWebhookEventCategory.api'
  import type {
    BIamWebhookEventCategoryDetailResponseVo,
    BIamWebhookEventCategorySimpleTreeResponseVo,
    BIamWebhookEventCategoryUpdateParentRequestVo
  } from './type/BIamWebhookEventCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    categoryName: '',
    categoryTreeOptions: [] as BIamWebhookEventCategorySimpleTreeResponseVo[],
    form: { id: '', parentId: '' } as BIamWebhookEventCategoryUpdateParentRequestVo
  })

  const loadCategoryTree = async () => {
    try {
      const response = await BIamWebhookEventCategoryApi.treeSimple()
      const root = response as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      state.categoryTreeOptions = root?.id ? [root] : []
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    }
  }

  const loadCategoryData = async () => {
    if (!props.categoryId) return
    try {
      state.loading = true
      const data: BIamWebhookEventCategoryDetailResponseVo = await BIamWebhookEventCategoryApi.detail({ id: props.categoryId })
      state.categoryName = data.name || ''
      state.form.id = data.id
      state.form.parentId = data.parentId || ''
    } catch (error) {
      console.error('加载分类详情失败', error)
      ElMessage.error('加载分类详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.form = { id: '', parentId: '' }
    state.categoryName = ''
    state.categoryTreeOptions = []
    state.loading = false
    state.submitting = false
  }

  const submitForm = async () => {
    try {
      if (!state.form.parentId) {
        ElMessage.warning('请选择父分类')
        return
      }
      state.submitting = true
      await BIamWebhookEventCategoryApi.updateParent(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('移动分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await loadCategoryData()
        await loadCategoryTree()
      }
    },
    { immediate: false }
  )
</script>
