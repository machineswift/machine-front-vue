<template>
  <el-dialog
    v-model="state.visible"
    title="移动类目"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="15vh"
  >
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="当前类目:">
        <el-input v-model="state.form.currentName" disabled>
          <template #prefix>
            <el-icon><FolderOpened /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="目标父类目:" prop="parentId" required>
        <el-input v-model="state.categoryQuery" placeholder="请输入关键字搜索类目" clearable @input="onCategoryQueryChanged" class="search-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-tree-v2
          ref="categoryTreeRef"
          :data="state.categoryTreeOptions"
          :props="state.categoryProps"
          :filter-method="categoryFilterMethod"
          :height="320"
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
          class="category-tree"
          :default-expanded-keys="state.defaultExpandedKeys"
        >
          <template #default="{ node }">
            <span class="tree-node-label">
              <el-icon class="tree-folder-icon"><FolderOpened /></el-icon>
              {{ node.data.name }}
            </span>
            <span class="tree-node-code" v-if="node.data.code">({{ node.data.code }})</span>
          </template>
        </el-tree-v2>
      </el-form-item>

      <el-form-item v-if="state.currentSelectedNode" label="已选择:">
        <el-tag type="primary" closable @close="clearSelection">
          <el-icon><FolderOpened /></el-icon>
          {{ state.currentSelectedNode.name }}
        </el-tag>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.loading"
        :disabled="!state.form.parentId"
        v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElTreeV2, ElMessage } from 'element-plus'
  import { reactive, ref, nextTick, type PropType } from 'vue'
  import { Search, FolderOpened } from '@element-plus/icons-vue'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps({
    categoryTree: {
      type: Object as PropType<ScmBackCategoryTreeSimpleResponseVo | null>,
      required: false,
      default: () => ({ children: [] })
    }
  })

  const emit = defineEmits(['success'])
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  // 组件状态
  const state = reactive({
    loading: false,
    visible: false,
    categoryQuery: '',
    categoryTreeOptions: [] as ScmBackCategoryTreeSimpleResponseVo[],
    categoryProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    form: {
      id: '',
      currentName: '',
      parentId: ''
    },
    currentSelectedNode: null as ScmBackCategoryTreeSimpleResponseVo | null,
    defaultExpandedKeys: [] as string[]
  })

  /**
   * 获取前两层节点的ID
   */
  const getFirstTwoLevelNodeIds = (nodes: ScmBackCategoryTreeSimpleResponseVo[], level = 1, result: string[] = []): string[] => {
    if (level > 2) return result

    nodes.forEach(node => {
      result.push(node.id)
      if (node.children && level < 2) {
        getFirstTwoLevelNodeIds(node.children, level + 1, result)
      }
    })
    return result
  }

  /**
   * 重置树形控件状态
   */
  const resetTreeState = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter('')
      categoryTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)

      if (state.form.parentId) {
        nextTick(() => {
          categoryTreeRef.value?.setCurrentKey(state.form.parentId)
        })
      }
    }
  }

  /**
   * 打开对话框并初始化数据
   */
  const open = (row: { id: string; name: string; parentId: string }) => {
    state.form.id = row.id
    state.form.currentName = row.name
    state.form.parentId = ''
    state.categoryTreeOptions = props.categoryTree ? [props.categoryTree] : []

    // 计算默认展开keys
    state.defaultExpandedKeys = props.categoryTree ? getFirstTwoLevelNodeIds([props.categoryTree]) : []

    state.categoryQuery = ''
    state.currentSelectedNode = null
    state.visible = true

    nextTick(() => {
      resetTreeState()
    })
  }

  /**
   * 处理搜索输入变化
   */
  const onCategoryQueryChanged = () => {
    if (!categoryTreeRef.value) return

    const query = state.categoryQuery.trim()
    categoryTreeRef.value.filter(query)

    if (query === '') {
      categoryTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)
    }
  }

  /**
   * 树节点过滤方法
   */
  const categoryFilterMethod = (query: string, node: ScmBackCategoryTreeSimpleResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || node.code?.toLowerCase().includes(query.toLowerCase()) || false
  }

  /**
   * 处理树节点点击
   */
  const handleNodeClick = (node: ScmBackCategoryTreeSimpleResponseVo) => {
    // 不能选择自己作为父节点
    if (node.id === state.form.id) {
      ElMessage.warning('不能选择当前类目作为父类目')
      return
    }

    state.form.parentId = node.id
    state.currentSelectedNode = node
  }

  /**
   * 清除选中
   */
  const clearSelection = () => {
    state.form.parentId = ''
    state.currentSelectedNode = null
    if (categoryTreeRef.value) {
      categoryTreeRef.value.setCurrentKey('')
    }
  }

  /**
   * 提交
   */
  const handleSubmit = async () => {
    if (!state.form.parentId) {
      ElMessage.warning('请选择一个目标父类目')
      return
    }

    try {
      state.loading = true
      await ScmBackCategoryApi.updateParent({
        id: state.form.id,
        parentId: state.form.parentId
      })
      ElMessage.success({
        message: '移动类目成功',
        duration: 2000
      })
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('移动类目失败', error)
      if (error instanceof Error) {
        ElMessage.error({
          message: error.message,
          duration: 5000,
          showClose: true
        })
      }
    } finally {
      state.loading = false
    }
  }

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    state.form = {
      id: '',
      currentName: '',
      parentId: ''
    }
    state.categoryQuery = ''
    state.currentSelectedNode = null
    state.loading = false
  }

  defineExpose({ open })
</script>

<style scoped lang="scss">
  .search-input {
    margin-bottom: 8px;
  }

  .category-tree {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px 0;

    .tree-node-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .tree-folder-icon {
      font-size: 15px;
      color: #e6a23c;
    }

    .tree-node-code {
      margin-left: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
</style>
