<template>
  <el-dialog v-model="visible" title="分类管理" width="600px" :close-on-click-modal="false" @closed="handleClosed">
    <el-alert title="请选择该素材所属的分类" type="info" show-icon :closable="false" style="margin-bottom: 20px" />

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
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    materialId: {
      type: String,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const visible = ref(false)
  const loading = ref(false)
  const categoryQuery = ref('')
  const selectedCategoryIds = ref<string[]>([])

  const categoryTreeOptions = ref<DataMaterialCategorySimpleTreeResponseVo[]>([])
  const categoryProps = {
    value: 'id',
    label: 'name',
    children: 'children'
  }

  // 获取分类树
  const fetchCategoryTree = async () => {
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      categoryTreeOptions.value = response.children || []
    } catch (error) {
      console.error('获取分类树失败', error)
    }
  }

  // 获取素材当前分类
  const fetchMaterialCategories = async () => {
    if (!props.materialId) return
    try {
      const res = await DataMaterialApi.detail({ id: props.materialId })
      selectedCategoryIds.value = [...(res.categoryIdSet || [])]

      // 设置选中的分类
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
      selectedCategoryIds.value = TreeDataUtil.getRootNodesFromSelected(categoryTreeOptions.value, categoryTreeRef.value.getCheckedKeys()).map(node => node.id)
    }
  }

  const handleSubmit = async () => {
    try {
      loading.value = true
      // 这里需要调用API更新素材分类
      // 假设有一个updateCategories的API方法
      await DataMaterialApi.updateCategories({
        id: props.materialId,
        categoryIdSet: selectedCategoryIds.value
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
  }

  watch(
    () => props.modelValue,
    val => {
      visible.value = val
      if (val) {
        fetchCategoryTree()
        fetchMaterialCategories()
      }
    }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })
</script>
