<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改父分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="8vh"
  >
    <el-form :model="state.form" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="当前分类:">
        <el-input v-model="state.categoryName" disabled />
      </el-form-item>
      <el-form-item label="新父分类:" prop="parentId">
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
        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagCategoryUpdateParentRequestVo } from '@/modules/data/tag/type/DataTagCategory.type'
  import type { DataTagCategoryTreeSimpleOutputDto, DataTagCategoryDetailResponseVo } from '@/modules/data/tag/type/DataTagCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' },
    type: { type: String, default: null }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    categoryName: '',
    categoryTreeOptions: [] as DataTagCategoryTreeSimpleOutputDto[],
    form: {
      id: '',
      parentId: ''
    } as DataTagCategoryUpdateParentRequestVo
  })

  const loadCategoryTree = async () => {
    if (!props.type) return
    try {
      state.loading = true
      const response = await DataTagCategoryApi.treeSimple({ type: props.type })

      // treeSimple 返回根节点，需包装成完整树
      const rootNode: DataTagCategoryTreeSimpleOutputDto = {
        id: response.id,
        parentId: '',
        type: '',
        sort: 0,
        name: response.name || '根节点',
        children: response.children || []
      }
      state.categoryTreeOptions = [rootNode]
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const loadCategoryData = async () => {
    if (!props.categoryId) return
    try {
      const data: DataTagCategoryDetailResponseVo = await DataTagCategoryApi.detail({ id: props.categoryId })
      state.categoryName = data.name || ''
      state.form.id = data.id
      state.form.parentId = data.parentId || ''
    } catch (error) {
      console.error('加载分类数据失败', error)
      ElMessage.error('加载分类数据失败')
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      id: '',
      parentId: ''
    }
    state.categoryName = ''
    state.categoryTreeOptions = []

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    try {
      if (!state.form.parentId) {
        ElMessage.warning('请选择父分类')
        return
      }

      state.submitting = true
      await DataTagCategoryApi.updateParent(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改父分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和分类ID变化
  watch(
    [() => props.modelValue, () => props.categoryId, () => props.type],
    async ([modelValue, categoryId, type]) => {
      if (modelValue && categoryId && type) {
        await loadCategoryData()
        await loadCategoryTree()
      }
    },
    { immediate: false }
  )
</script>
