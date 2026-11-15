<template>
  <div class="tree-panel">
    <el-alert v-if="tip" :title="tip" type="info" show-icon :closable="false" class="tree-panel-tip" />

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
      :check-strictly="checkStrictly"
      show-checkbox
      class="tree-panel-tree"
      @check="handleCheck"
    >
      <template #default="{ node }">
        <span class="tree-panel-node">
          <el-icon v-if="icon" class="tree-panel-icon"><component :is="icon" /></el-icon>
          <span class="tree-panel-name"><HighlightText :text="node.data.name" :ranges="getRanges(node.data.id, 'name')" /></span>
          <span v-if="node.data.code" class="tree-panel-code">
            <HighlightText :text="`(${node.data.code})`" :ranges="codeRanges(node.data.id)" />
          </span>
        </span>
      </template>
    </el-tree-v2>

    <div class="tree-panel-selected">
      <span class="tree-panel-selected-label">已选：</span>
      <template v-if="selectedNodes.length">
        <el-tag v-for="node in selectedNodes" :key="node.id" size="small" :closable="closableTags && !readonly" @close="uncheck(node.id)">
          {{ node.name }}
        </el-tag>
      </template>
      <span v-else class="tree-panel-selected-empty">{{ emptyTagsText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, type Component } from 'vue'
  import { ElTreeV2, type TreeNodeData } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import HighlightText from '@/shared/components/HighlightText.vue'
  import { useTreeSearch } from '@/shared/composables/useTreeSearch'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { TreePickerNode } from '@/shared/types/Common.type'

  const props = withDefaults(
    defineProps<{
      modelValue?: string[]
      roots?: TreePickerNode[]
      height?: number
      tip?: string
      icon?: Component
      placeholder?: string
      emptyTagsText?: string
      closableTags?: boolean
      /** 只展开已勾选节点所在路径（默认展开根节点及其一级子节点） */
      expandCheckedOnly?: boolean
      /** 父子节点不联动勾选：用于需要精确勾选单个层级节点的场景 */
      checkStrictly?: boolean
      /** 只读模式：仅回显勾选结果，用户不能改动勾选 */
      readonly?: boolean
    }>(),
    {
      modelValue: () => [],
      roots: () => [],
      height: 260,
      tip: '',
      icon: undefined,
      placeholder: '输入名称或编码搜索',
      emptyTagsText: '暂无选择',
      closableTags: true,
      expandCheckedOnly: false,
      checkStrictly: false,
      readonly: false
    }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

  const treeRef = ref<InstanceType<typeof ElTreeV2>>()

  const {
    searchText,
    matchCount,
    showMatchCount,
    isSearching,
    findNode,
    collectRootIds,
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

  /**
   * 只展开勾选路径模式下，记录需要展开的勾选节点。
   * 用独立 ref（而非直接从 modelValue 派生）是为了：用户手动勾选时不改动展开状态，避免编辑过程中已展开的分支被收起。
   */
  const checkedExpandedKeys = ref<string[]>([])
  const expandedKeys = computed<string[]>(() => (props.expandCheckedOnly ? checkedExpandedKeys.value : defaultExpandedKeys()))
  const selectedNodes = computed(() => props.modelValue.map(id => findNode(id)).filter((node): node is TreePickerNode => !!node))
  const emptyText = computed(() => (isSearching.value ? '未找到匹配的节点' : '暂无数据'))

  const treeProps = {
    value: 'id',
    label: 'name',
    children: 'children',
    // 业务数据里的 disabled 标记（如素材的「未分类」虚拟节点）
    disabled: 'disabled'
  }

  const handleCheck = (_data: TreeNodeData, info: { checkedKeys: (string | number)[] }) => {
    // 只读模式下勾选变化立即还原，仅展示外部传入的勾选结果
    if (props.readonly) {
      treeRef.value?.setCheckedKeys(props.modelValue)
      return
    }
    emit('update:modelValue', collectRootIds(info.checkedKeys.map(key => String(key))))
  }

  const uncheck = (id: string) => {
    const ids = props.modelValue.filter(item => item !== id)
    treeRef.value?.setCheckedKeys(ids)
    emit('update:modelValue', ids)
  }

  // 回显服务端已选数据；只展开勾选路径模式下，同步展开勾选节点所在路径（含祖先），
  // 否则深层勾选节点会因父级折叠而看不见
  const setCheckedKeys = (ids: string[] = []) => {
    let expandedIds: string[] = []
    if (props.expandCheckedOnly) {
      expandedIds = TreeDataUtil.getAllParentNodes(props.roots, ids).map(node => node.id)
      checkedExpandedKeys.value = expandedIds
    }
    nextTick(() => {
      treeRef.value?.setCheckedKeys(ids)
      // 显式展开，避免仅依赖 default-expanded-keys 变更的生效时机
      if (props.expandCheckedOnly) treeRef.value?.setExpandedKeys(expandedIds)
    })
  }

  const reset = () => {
    resetSearch()
    checkedExpandedKeys.value = []
    // 清空过滤状态，避免下次打开仍是上次的搜索结果
    treeRef.value?.filter('')
    treeRef.value?.setCheckedKeys([])
    nextTick(() => treeRef.value?.setExpandedKeys(expandedKeys.value))
  }

  onBeforeUnmount(() => resetSearch())

  defineExpose({ setCheckedKeys, reset })
</script>

<style scoped lang="scss">
  .tree-panel {
    width: 100%;
  }

  .tree-panel-tip {
    margin-bottom: 8px;
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

  .tree-panel-selected-empty {
    color: #909399;
  }
</style>
