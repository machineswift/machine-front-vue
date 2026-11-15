<template>
  <el-dialog v-model="visible" title="修改分类" width="clamp(480px, 46vw, 640px)" align-center :close-on-click-modal="false" @closed="handleClosed">
    <TreeCheckPanel
      ref="categoryPanelRef"
      v-model="selectedCategoryIds"
      :roots="categoryTreeOptions"
      :height="300"
      tip="请选择该品牌所属的分类"
      :icon="PriceTag"
      placeholder="输入分类名称或编码搜索"
      empty-tags-text="暂无所属分类"
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
  import { PriceTag } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataBrandCategoryApi } from '@/modules/data/brand/api/DataBrandCategory.api'
  import type { DataBrandCategorySimpleTreeResponseVo } from '@/modules/data/brand/type/DataBrandCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()
  const visible = ref(false)
  const loading = ref(false)
  const selectedCategoryIds = ref<string[]>([])
  const categoryTreeOptions = ref<(DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[]>([])

  /** 【未分配】虚拟节点 id，与后端一致，该节点不可选为分类 */
  const DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID = 'data_brand_category_virtual_node'

  /** 递归为虚拟节点设置 disabled，禁止选择为分类 */
  const setVirtualNodeDisabled = (nodes: (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[]): void => {
    if (!nodes?.length) return
    for (const node of nodes) {
      if (node.id === DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID) {
        node.disabled = true
      }
      if (node.children?.length) {
        setVirtualNodeDisabled(node.children as (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[])
      }
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const response = await DataBrandCategoryApi.treeSimple()
      const root = response as unknown as DataBrandCategorySimpleTreeResponseVo & { children?: DataBrandCategorySimpleTreeResponseVo[] }
      const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
      const treeWithDisabled = JSON.parse(JSON.stringify(rawTree)) as (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[]
      setVirtualNodeDisabled(treeWithDisabled)
      categoryTreeOptions.value = treeWithDisabled
    } catch (error) {
      console.error('获取分类树失败', error)
    }
  }

  const fetchBrandDetail = async () => {
    if (!props.brandId) return
    try {
      const res = await DataBrandApi.detail({ id: props.brandId })
      selectedCategoryIds.value = [...(res?.categoryIdSet || [])].filter(id => id !== DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID)
      categoryPanelRef.value?.setCheckedKeys(selectedCategoryIds.value)
    } catch (error) {
      console.error('获取品牌分类失败', error)
    }
  }

  const handleSubmit = async () => {
    try {
      loading.value = true
      await DataBrandApi.updateCategory({
        id: props.brandId,
        categoryIdSet: selectedCategoryIds.value.filter(id => id !== DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID)
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
    selectedCategoryIds.value = []
    categoryPanelRef.value?.reset()
  }

  watch(
    () => props.modelValue,
    async val => {
      visible.value = val
      if (val) {
        // 先加载树再回显勾选，避免落在未渲染的节点上
        await fetchCategoryTree()
        await fetchBrandDetail()
      }
    },
    { immediate: false }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })
</script>
