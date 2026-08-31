<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改父分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="当前分类:">
        <el-input v-model="state.categoryName" disabled />
      </el-form-item>
      <el-form-item label="新父分类:" prop="parentId">
        <el-tree-select
          v-model="state.form.parentId"
          :data="state.categoryTreeOptions"
          :props="categoryProps"
          placeholder="请选择父分类"
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
          :filter-node-method="filterNode"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE_PARENT']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
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

  const categoryProps = {
    value: 'id',
    label: 'name',
    children: 'children'
  }

  // 过滤节点，排除当前节点及其子节点
  const filterNode = (value: string, data: DataTagCategoryTreeSimpleOutputDto): boolean => {
    if (!value) return true
    // 排除当前节点
    if (data.id === state.form.id) return false
    // 排除当前节点的所有子节点
    return !isDescendant(data, state.form.id)
  }

  // 检查节点是否是某个节点的后代
  const isDescendant = (node: DataTagCategoryTreeSimpleOutputDto, ancestorId: string): boolean => {
    if (node.id === ancestorId) return true
    if (node.children && node.children.length > 0) {
      return node.children.some(child => isDescendant(child, ancestorId))
    }
    return false
  }

  // 从树中移除当前节点及其子节点
  const removeNodeAndChildren = (nodes: DataTagCategoryTreeSimpleOutputDto[], nodeId: string): DataTagCategoryTreeSimpleOutputDto[] => {
    return nodes
      .filter(node => node.id !== nodeId)
      .map(node => ({
        ...node,
        children: node.children ? removeNodeAndChildren(node.children, nodeId) : []
      }))
  }

  const loadCategoryTree = async () => {
    if (!props.type) return
    try {
      state.loading = true
      const response = await DataTagCategoryApi.treeSimple({ type: props.type })

      // 如果当前节点是根节点，则只显示根节点（但会被过滤掉，因为不能选择自己）
      // 如果当前节点不是根节点，则显示完整的树（包括根节点）
      if (state.form.id && state.form.id === response.id) {
        // 当前节点就是根节点，不显示任何选项（因为不能选择自己）
        state.categoryTreeOptions = []
      } else {
        // 当前节点不是根节点，显示完整的树（包括根节点）
        // 构建包含根节点的树结构
        const rootNode: DataTagCategoryTreeSimpleOutputDto = {
          id: response.id,
          parentId: '',
          type: '',
          sort: 0,
          name: response.name || '根节点',
          children: response.children || []
        }

        // 从树中移除当前节点及其子节点
        let treeData: DataTagCategoryTreeSimpleOutputDto[] = [rootNode]
        if (state.form.id) {
          treeData = removeNodeAndChildren(treeData, state.form.id)
        }

        state.categoryTreeOptions = treeData
      }
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
