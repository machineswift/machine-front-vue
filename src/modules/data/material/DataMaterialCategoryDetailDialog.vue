<template>
  <el-dialog
    v-model="state.visible"
    title="素材分类详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(760px, 70vw, 1280px)"
    align-center
  >
    <div v-loading="state.loading" class="category-detail">
      <!-- 左侧：分类树，勾选当前分类且只展开勾选路径 -->
      <aside class="category-detail-tree">
        <div class="category-detail-section-title">分类层级</div>
        <TreeCheckPanel
          ref="treePanelRef"
          v-model="state.checkedIds"
          :roots="state.treeOptions"
          :height="376"
          :icon="FolderOpened"
          placeholder="输入分类名称或编码搜索"
          empty-tags-text="未分类"
          :closable-tags="false"
          expand-checked-only
          check-strictly
          readonly
        />
      </aside>

      <!-- 右侧：基本信息 + 操作信息 -->
      <section class="category-detail-info">
        <header class="category-detail-header">
          <span class="category-detail-name" :title="state.detailData.name || '无'">{{ state.detailData.name || '无' }}</span>
          <el-tag v-if="state.detailData.code" size="small" type="info">{{ state.detailData.code }}</el-tag>
        </header>

        <div class="category-detail-path">
          <el-icon class="category-detail-path-icon"><Location /></el-icon>
          <template v-if="categoryPath.length">
            <span v-for="(name, index) in categoryPath" :key="index" class="category-detail-path-item">
              <span>{{ name }}</span>
              <el-icon v-if="index < categoryPath.length - 1" class="category-detail-path-sep"><ArrowRight /></el-icon>
            </span>
          </template>
          <span v-else>未分类</span>
        </div>

        <el-descriptions class="category-detail-descriptions" :column="2" border size="small" title="基本信息">
          <el-descriptions-item label="排序">{{ state.detailData.sort ?? '无' }}</el-descriptions-item>
          <el-descriptions-item label="上级分类">{{ parentCategoryName }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions class="category-detail-descriptions" :column="2" border size="small" title="操作信息">
          <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </section>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowRight, FolderOpened, Location } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type { DataMaterialCategoryDetailResponseVo, DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'

  /** 未分类虚拟节点 id：详情只说真实分类的层级，虚拟节点不参与展示 */
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'

  const props = defineProps<{
    modelValue: boolean
    categoryId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const treePanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<DataMaterialCategoryDetailResponseVo>,
    treeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    checkedIds: [] as string[]
  })

  // 格式化时间戳
  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  /** 剔除「未分类」虚拟节点 */
  const removeVirtualNode = (nodes: DataMaterialCategorySimpleTreeResponseVo[]): DataMaterialCategorySimpleTreeResponseVo[] =>
    nodes
      .filter(node => node.id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      .map(node => (node.children?.length ? { ...node, children: removeVirtualNode(node.children) } : node))

  /** 从根节点到目标分类的名称路径 */
  const findCategoryPath = (nodes: DataMaterialCategorySimpleTreeResponseVo[], id: string): string[] => {
    if (!id) return []
    for (const node of nodes) {
      if (node.id === id) return [node.name]
      if (node.children?.length) {
        const childPath = findCategoryPath(node.children, id)
        if (childPath.length) return [node.name, ...childPath]
      }
    }
    return []
  }

  const categoryPath = computed(() => findCategoryPath(state.treeOptions, props.categoryId || ''))

  const parentCategoryName = computed(() => {
    const path = categoryPath.value
    return path.length > 1 ? path[path.length - 2] : '顶级分类'
  })

  const fetchCategoryTree = async () => {
    const response = await DataMaterialCategoryApi.treeSimple()
    const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo
    const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
    state.treeOptions = removeVirtualNode(rawTree)
  }

  const fetchData = async () => {
    if (!props.categoryId) return
    try {
      state.loading = true
      const [detail] = await Promise.all([DataMaterialCategoryApi.detail({ id: props.categoryId }), fetchCategoryTree()])
      state.detailData = detail || {}
      // 树渲染完成后再回显勾选，勾选节点所在的祖先路径会被自动展开
      state.checkedIds = [props.categoryId]
      await nextTick()
      treePanelRef.value?.setCheckedKeys(state.checkedIds)
    } catch (error) {
      console.error('获取分类详情失败', error)
      ElMessage.error('获取分类详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {}
    state.treeOptions = []
    state.checkedIds = []
    state.loading = false
    treePanelRef.value?.reset()
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) await fetchData()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .category-detail {
    display: grid;
    grid-template-columns: minmax(280px, 0.85fr) minmax(340px, 1fr);
    gap: 20px;
    align-items: start;
  }

  .category-detail-tree {
    min-width: 0;
    padding: 12px;
    background-color: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 6px;
  }

  .category-detail-section-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .category-detail-info {
    min-width: 0;
  }

  .category-detail-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .category-detail-name {
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-detail-path {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 12px;
    color: #909399;
  }

  .category-detail-path-icon {
    margin-right: 2px;
  }

  .category-detail-path-item {
    display: inline-flex;
    gap: 2px;
    align-items: center;
  }

  .category-detail-path-sep {
    font-size: 12px;
    color: #c0c4cc;
  }

  .category-detail-descriptions + .category-detail-descriptions {
    margin-top: 14px;
  }

  @media (max-width: 900px) {
    .category-detail {
      grid-template-columns: 1fr;
    }
  }
</style>
