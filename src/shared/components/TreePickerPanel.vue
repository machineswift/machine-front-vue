<template>
  <div class="tree-panel">
    <el-input v-model="searchText" :placeholder="placeholder" clearable class="tree-panel-search" @input="handleSearchInput" @clear="handleSearchClear">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #suffix>
        <span v-if="showMatchCount" class="tree-panel-count">命中 {{ matchCount }}</span>
      </template>
    </el-input>

    <el-tree-v2
      ref="treeRef"
      :data="roots"
      :props="treeProps"
      :filter-method="filterMethod"
      :height="height"
      :empty-text="emptyText"
      :default-expanded-keys="expandedKeys"
      :current-node-key="modelValue"
      highlight-current
      class="tree-panel-tree"
      @node-click="handleNodeClick"
    >
      <template #default="{ node }">
        <span class="tree-panel-node">
          <el-icon v-if="icon" class="tree-panel-icon"><component :is="icon" /></el-icon>
          <span class="tree-panel-name"><HighlightText :text="node.data.name" :ranges="getRanges(node.data.id, 'name')" /></span>
          <span v-if="node.data.code" class="tree-panel-code">
            <HighlightText :text="`(${node.data.code})`" :ranges="codeRanges(node.data.id)" />
          </span>
          <span v-if="excludedIds.has(node.data.id)" class="tree-panel-badge">不可选</span>
        </span>
      </template>
    </el-tree-v2>

    <div v-if="selectedNode" class="tree-panel-selected">
      <span class="tree-panel-selected-label">已选择：</span>
      <el-tag type="primary" closable @close="clear">
        <el-icon v-if="icon"><component :is="icon" /></el-icon>
        <span class="tree-panel-selected-name">{{ selectedNode.name }}</span>
        <span v-if="selectedNode.code" class="tree-panel-selected-code">({{ selectedNode.code }})</span>
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, type Component } from 'vue'
  import { ElMessage, ElTreeV2, type TreeNodeData } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import HighlightText from '@/shared/components/HighlightText.vue'
  import { useTreeSearch } from '@/shared/composables/useTreeSearch'
  import type { TreePickerNode } from '@/shared/types/Common.type'

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      roots?: TreePickerNode[]
      excludeId?: string
      excludeMessage?: string
      placeholder?: string
      height?: number
      icon?: Component
    }>(),
    {
      modelValue: '',
      roots: () => [],
      excludeId: '',
      excludeMessage: '不能选择该节点',
      placeholder: '输入名称或编码搜索',
      height: 320,
      icon: undefined
    }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const treeRef = ref<InstanceType<typeof ElTreeV2>>()

  const {
    searchText,
    matchCount,
    showMatchCount,
    isSearching,
    findNode,
    collectSubtreeIds,
    defaultExpandedKeys,
    handleSearchInput,
    handleSearchClear,
    resetSearch,
    filterMethod,
    getRanges,
    codeRanges
  } = useTreeSearch<TreePickerNode>({
    roots: () => props.roots,
    tree: () => treeRef.value,
    expandedKeys: (): string[] => expandedKeys.value
  })

  const expandedKeys = computed<string[]>(() => defaultExpandedKeys(props.modelValue ? [props.modelValue] : []))
  const excludedIds = computed(() => collectSubtreeIds(props.excludeId))
  const selectedNode = computed(() => (props.modelValue ? findNode(props.modelValue) : null))
  const emptyText = computed(() => (isSearching.value ? '未找到匹配的节点' : '暂无数据'))

  const treeProps = {
    value: 'id',
    label: 'name',
    children: 'children',
    class: (data: TreeNodeData) => (excludedIds.value.has((data as TreePickerNode).id) ? 'is-excluded' : '')
  }

  const handleNodeClick = (data: TreeNodeData) => {
    const node = data as TreePickerNode
    if (excludedIds.value.has(node.id)) {
      ElMessage.warning(props.excludeMessage)
      return
    }

    emit('update:modelValue', node.id)
  }

  const clear = () => emit('update:modelValue', '')

  const reset = () => {
    resetSearch()
    // 清空过滤状态，避免下次打开仍是上次的搜索结果
    treeRef.value?.filter('')
    nextTick(() => treeRef.value?.setExpandedKeys(expandedKeys.value))
  }

  onBeforeUnmount(() => resetSearch())

  defineExpose({ reset })
</script>

<style scoped lang="scss">
  .tree-panel {
    width: 100%;
  }

  .tree-panel-search {
    margin-bottom: 8px;
  }

  .tree-panel-count {
    font-size: 12px;
    color: #909399;
  }

  .tree-panel-tree {
    padding: 4px 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    /* 当前节点高亮 + 不可选节点置灰 */
    :deep(.el-tree-node) {
      &.is-current > .el-tree-node__content {
        background-color: #ecf5ff;
      }

      &.is-excluded .tree-panel-node {
        color: #c0c4cc;
        cursor: not-allowed;
      }
    }

    :deep(.el-tree-node__content) {
      padding: 0 8px;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .tree-panel-node {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding-right: 8px;
    font-size: 14px;
  }

  .tree-panel-icon {
    font-size: 14px;
    color: #409eff;
  }

  .tree-panel-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-panel-code {
    font-size: 12px;
    color: #909399;
  }

  .tree-panel-badge {
    margin-left: 4px;
    padding: 0 4px;
    font-size: 11px;
    line-height: 16px;
    color: #909399;
    background-color: #f4f4f5;
    border-radius: 2px;
  }

  .tree-panel-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    margin-top: 8px;
    font-size: 13px;
    color: #606266;
  }

  .tree-panel-selected-label {
    flex: none;
  }

  .tree-panel-selected-name {
    margin-left: 4px;
  }

  .tree-panel-selected-code {
    margin-left: 2px;
    font-size: 12px;
    opacity: 0.85;
  }
</style>
