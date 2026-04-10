<template>
  <el-dialog v-model="state.dialogVisible" title="修改父分类" :close-on-click-modal="false" :destroy-on-close="true" @closed="handleDialogClosed" width="480px">
    <el-form :model="state.form" label-width="90px" ref="formRef" v-loading="state.loading">
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
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE_PARENT']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type {
    DataMaterialCategoryUpdateParentRequestVo,
    DataMaterialCategorySimpleTreeResponseVo,
    DataMaterialCategoryDetailResponseVo
  } from '@/modules/data/material/type/DataMaterialCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' }
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
    categoryTreeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    form: { id: '', parentId: '' } as DataMaterialCategoryUpdateParentRequestVo
  })

  const categoryProps = { value: 'id', label: 'name', children: 'children' }

  const isDescendant = (node: DataMaterialCategorySimpleTreeResponseVo, ancestorId: string): boolean => {
    if (node.id === ancestorId) return true
    if (node.children?.length) return node.children.some(child => isDescendant(child, ancestorId))
    return false
  }

  const filterNode = (value: string, data: DataMaterialCategorySimpleTreeResponseVo): boolean => {
    if (!value) return true
    if (data.id === state.form.id) return false
    return !isDescendant(data, state.form.id)
  }

  const removeNodeAndChildren = (nodes: DataMaterialCategorySimpleTreeResponseVo[], nodeId: string): DataMaterialCategorySimpleTreeResponseVo[] => {
    return nodes
      .filter(node => node.id !== nodeId)
      .map(node => ({
        ...node,
        children: node.children ? removeNodeAndChildren(node.children, nodeId) : []
      }))
  }

  const loadCategoryTree = async () => {
    try {
      state.loading = true
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const children = root?.children || (root?.id ? [root] : [])
      if (state.form.id && root?.id && state.form.id === root.id) {
        state.categoryTreeOptions = []
      } else {
        let treeData: DataMaterialCategorySimpleTreeResponseVo[] =
          root?.id && root?.name
            ? [
                {
                  id: root.id,
                  parentId: root.parentId ?? '',
                  name: root.name,
                  code: root.code ?? '',
                  sort: root.sort ?? 0,
                  children
                }
              ]
            : children
        if (state.form.id) treeData = removeNodeAndChildren(treeData, state.form.id)
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
      const data: DataMaterialCategoryDetailResponseVo = await DataMaterialCategoryApi.detail({ id: props.categoryId })
      state.categoryName = data.name || ''
      state.form.id = data.id!
      state.form.parentId = data.parentId || ''
    } catch (error) {
      console.error('加载分类数据失败', error)
      ElMessage.error('加载分类数据失败')
    }
  }

  const handleDialogClosed = () => {
    state.form = { id: '', parentId: '' }
    state.categoryName = ''
    state.categoryTreeOptions = []
    formRef.value?.resetFields()
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
      await DataMaterialCategoryApi.updateParent(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改父分类失败', error)
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
