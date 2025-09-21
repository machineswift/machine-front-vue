<template>
  <el-dialog
    v-model="uiState.visible"
    title="修改父区域"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="当前区域:">
        <el-input v-model="form.currentName" disabled />
      </el-form-item>
      <el-form-item label="新父区域:" prop="parentId">
        <div class="tree-select-container">
          <el-input v-model="uiState.searchText" placeholder="输入区域名称或编码搜索" clearable @clear="resetSearch" @input="handleSearch" class="search-input">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-tree-select
            v-model="form.parentId"
            :data="displayTreeData"
            node-key="id"
            :props="treeProps"
            placeholder="请选择父区域"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
            :load="loadNode"
            lazy
            :virtualized="true"
            :height="300"
            highlight-current
            :filterable="false"
            @visible-change="handleDropdownVisible"
            ref="treeSelectRef"
            :popper-append-to-body="false"
            :default-expanded-keys="treeState.defaultExpandedKeys"
          >
            <template #default="{ node }">
              <span class="custom-tree-node">
                <span v-if="node.loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </span>
                <span>{{ node.label }}</span>
                <span v-if="node.data?.code" class="node-code">({{ node.data.code }})</span>
              </span>
            </template>
          </el-tree-select>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="uiState.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="uiState.loading" v-hasPermission="['SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import Fuse from 'fuse.js'
  import { debounce } from 'lodash-es'
  import type { ElTreeSelect } from 'element-plus'
  import { Search, Loading } from '@element-plus/icons-vue'
  import { ref, reactive, computed, nextTick, type PropType } from 'vue'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import type { DataAreaExpandTreeResponseVo } from '@/modules/data/area/type/DataArea.type'

  const props = defineProps({
    areaTree: {
      type: Object as PropType<DataAreaExpandTreeResponseVo | null>,
      default: null
    }
  })

  // 状态管理
  const uiState = reactive({
    visible: false,
    loading: false,
    dropdownVisible: false,
    searchText: ''
  })

  const treeState = reactive({
    cache: new Map<string, DataAreaExpandTreeResponseVo[]>(),
    flatData: [] as DataAreaExpandTreeResponseVo[],
    defaultExpandedKeys: [] as string[],
    searchResults: [] as DataAreaExpandTreeResponseVo[]
  })

  const form = reactive({
    id: '',
    currentName: '',
    parentId: ''
  })

  const treeSelectRef = ref<InstanceType<typeof ElTreeSelect>>()
  const fuse = ref<Fuse<DataAreaExpandTreeResponseVo>>()

  // 计算属性
  const displayTreeData = computed(() => {
    return uiState.searchText ? treeState.searchResults : props.areaTree ? [props.areaTree] : []
  })

  const treeProps = {
    label: 'name',
    children: 'children',
    isLeaf: (data: DataAreaExpandTreeResponseVo) => data.isLeaf ?? !data.hasChildren
  }

  // 方法
  const openDropdown = () => {
    const input = treeSelectRef.value?.$el?.querySelector?.('.el-select__input')
    input?.click()
    uiState.dropdownVisible = true
  }

  const handleSearch = debounce(() => {
    if (!uiState.searchText.trim()) {
      resetSearch()
      return
    }

    if (fuse.value) {
      treeState.searchResults = fuse.value.search(uiState.searchText).map(r => r.item)
      nextTick(openDropdown)
    }
  }, 500)

  const resetSearch = () => {
    uiState.searchText = ''
    treeState.searchResults = []
    treeState.defaultExpandedKeys = props.areaTree ? [props.areaTree.id] : []
  }

  const handleDropdownVisible = (isVisible: boolean) => {
    uiState.dropdownVisible = isVisible
    if (!isVisible && !uiState.searchText.trim()) {
      treeState.searchResults = []
    }
  }

  const loadNode = async (node: DataAreaExpandTreeResponseVo, resolve: (data: DataAreaExpandTreeResponseVo[]) => void) => {
    if (node.level === 0) {
      return resolve(props.areaTree ? [props.areaTree] : [])
    }

    const parentId = node.data.id
    if (treeState.cache.has(parentId)) {
      return resolve(treeState.cache.get(parentId)!)
    }

    try {
      node.loading = true
      const children = node.data.children || []
      treeState.cache.set(parentId, children)
      updateFlatTreeData(children)
      resolve(children)
    } catch (error) {
      console.error('加载子节点失败', error)
      resolve([])
    } finally {
      node.loading = false
    }
  }

  const updateFlatTreeData = (nodes: DataAreaExpandTreeResponseVo[]) => {
    nodes.forEach(node => {
      if (!treeState.flatData.some(item => item.id === node.id)) {
        treeState.flatData.push(node)
      }
    })
    fuse.value?.setCollection(treeState.flatData)
  }

  const initFuse = () => {
    fuse.value = new Fuse(treeState.flatData, {
      keys: ['name', 'code'],
      includeMatches: true,
      threshold: 0.1,
      minMatchCharLength: 1,
      ignoreLocation: true,
      distance: 30,
      findAllMatches: true,
      shouldSort: true
    })
  }

  const flattenTree = (node: DataAreaExpandTreeResponseVo) => {
    treeState.flatData.push(node)
    if (node.children?.length) {
      node.children.forEach(child => flattenTree(child))
      node.hasChildren = node.children.length > 0
    }
  }

  const open = (row: { id: string; name: string; parentId: string }) => {
    form.id = row.id
    form.currentName = row.name
    form.parentId = row.parentId

    // 重置状态
    uiState.searchText = ''
    treeState.searchResults = []
    treeState.cache.clear()
    treeState.flatData = []

    // 初始化树数据
    if (props.areaTree) {
      flattenTree(props.areaTree)
      treeState.cache.set(props.areaTree.id, props.areaTree.children || [])
      treeState.defaultExpandedKeys = [props.areaTree.id]
      initFuse()
    }

    uiState.visible = true
    nextTick(openDropdown)
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    form.id = ''
    form.currentName = ''
    form.parentId = ''

    // 清空搜索和树状态
    uiState.searchText = ''
    treeState.searchResults = []
    treeState.cache.clear()
    treeState.flatData = []
    treeState.defaultExpandedKeys = []

    // 重置UI状态
    uiState.loading = false
    uiState.dropdownVisible = false

    // 重置树选择器状态
    treeSelectRef.value?.clear()
  }

  const handleSubmit = async () => {
    try {
      uiState.loading = true
      await DataAreaApi.updateParent({
        id: form.id,
        parentId: form.parentId
      })
      uiState.visible = false
      emit('success')
    } catch (error) {
      console.error('修改父区域失败', error)
    } finally {
      uiState.loading = false
    }
  }

  const emit = defineEmits(['success'])
  defineExpose({ open })
</script>

<style scoped lang="scss">
  .tree-select-container {
    width: 100%;

    .search-input {
      margin-bottom: 10px;
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 14px;
      padding-right: 8px;
      .node-code {
        margin-left: 8px;
        color: #999;
        font-size: 12px;
      }
    }
  }
</style>
