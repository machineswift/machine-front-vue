<template>
  <el-dialog v-model="visible" title="修改分类" width="520px" :close-on-click-modal="false" @closed="handleClosed">
    <el-alert title="请选择该素材所属的分类" type="info" show-icon :closable="false" style="margin-bottom: 16px" />
    <el-input v-model="categoryQuery" placeholder="请输入分类名称" @input="onCategoryQueryChanged" style="margin-bottom: 10px" />
    <el-tree-v2
      ref="categoryTreeRef"
      :data="categoryTreeOptions"
      :props="categoryProps"
      :filter-method="categoryFilterMethod"
      @check="handleCategoryCheck"
      show-checkbox
      :height="300"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ElTreeV2 } from 'element-plus'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'
  import { TreeDataUtil } from '@/common/utils/TreeData.util'

  /** 未分类虚拟节点 id，与后端一致，该节点不可选为分类 */
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    materialId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const visible = ref(false)
  const loading = ref(false)
  const categoryQuery = ref('')
  const selectedCategoryIds = ref<string[]>([])
  const materialDetail = ref<{ title?: string; attachmentId?: string }>({})

  const categoryTreeOptions = ref<(DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]>([])
  const categoryProps = { value: 'id', label: 'name', children: 'children', disabled: 'disabled' }

  /** 递归为虚拟节点设置 disabled，禁止选择为分类 */
  const setVirtualNodeDisabled = (nodes: (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]): void => {
    if (!nodes?.length) return
    for (const node of nodes) {
      if (node.id === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID) {
        node.disabled = true
      }
      if (node.children?.length) {
        setVirtualNodeDisabled(node.children as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[])
      }
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
      const treeWithDisabled = JSON.parse(JSON.stringify(rawTree)) as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]
      setVirtualNodeDisabled(treeWithDisabled)
      categoryTreeOptions.value = treeWithDisabled
    } catch (error) {
      console.error('获取分类树失败', error)
    }
  }

  const fetchMaterialDetail = async () => {
    if (!props.materialId) return
    try {
      const res = await DataMaterialApi.detail({ id: props.materialId })
      materialDetail.value = { title: res?.title, attachmentId: res?.attachmentId }
      selectedCategoryIds.value = [...(res?.categoryIdSet || [])].filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      if (categoryTreeRef.value) {
        categoryTreeRef.value.setCheckedKeys(selectedCategoryIds.value)
      }
    } catch (error) {
      console.error('获取素材分类失败', error)
    }
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(categoryQuery.value.trim())
    }
    if (categoryQuery.value.trim() === '') {
      categoryTreeRef.value?.setExpandedKeys([])
    }
  }

  const categoryFilterMethod = (query: string, node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      const ids = TreeDataUtil.getRootNodesFromSelected(categoryTreeOptions.value, categoryTreeRef.value.getCheckedKeys())
        .map(node => node.id)
        .filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      selectedCategoryIds.value = ids
    }
  }

  const handleSubmit = async () => {
    const categoryIdSet = selectedCategoryIds.value.filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
    try {
      loading.value = true
      await DataMaterialApi.updateCategory({
        id: props.materialId,
        categoryIdSet
      })
      ElMessage.success('保存成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('保存分类失败', error)
      ElMessage.error('保存失败')
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    categoryQuery.value = ''
    selectedCategoryIds.value = []
    materialDetail.value = {}
  }

  watch(
    () => props.modelValue,
    val => {
      visible.value = val
      if (val) {
        fetchCategoryTree()
        fetchMaterialDetail()
      }
    },
    { immediate: false }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })
</script>
