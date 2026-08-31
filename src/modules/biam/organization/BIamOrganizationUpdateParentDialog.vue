<template>
  <el-dialog
    v-model="state.visible"
    title="修改父节点"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="60%"
    top="5vh"
  >
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="当前组织:">
        <el-input v-model="state.form.currentName" disabled />
      </el-form-item>
      <el-form-item label="新父节点:" prop="parentId" required>
        <el-input v-model="state.organizationQuery" placeholder="请输入关键字筛选" clearable @input="onOrganizationQueryChanged" />
        <el-tree-v2
          ref="organizationTreeRef"
          :data="state.organizationTreeOptions"
          :props="state.organizationProps"
          :filter-method="organizationFilterMethod"
          :height="320"
          node-key="id"
          highlight-current
          @node-click="(data: TreeNodeData) => handleNodeClick(data as BIamOrganizationExpandTreeResponseVo)"
          class="organization-tree"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.loading"
        :disabled="!state.form.parentId"
        v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, ref, nextTick, type PropType } from 'vue'
  import { ElTreeV2, ElMessage, type TreeNodeData } from 'element-plus'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import type { BIamOrganizationExpandTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'

  const props = defineProps({
    organizationTree: {
      type: Object as PropType<BIamOrganizationExpandTreeResponseVo | null>,
      required: false,
      default: () => ({ children: [] })
    }
  })

  // 组件状态
  const state = reactive({
    loading: false,
    visible: false,
    organizationQuery: '',
    organizationTreeOptions: [] as BIamOrganizationExpandTreeResponseVo[],
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    form: {
      id: '',
      currentName: '',
      parentId: ''
    },
    currentSelectedNode: null as BIamOrganizationExpandTreeResponseVo | null,
    // 新增状态，用于存储默认展开的keys
    defaultExpandedKeys: [] as string[]
  })

  const organizationTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  /**
   * 获取前两层节点的ID
   */
  const getFirstTwoLevelNodeIds = (nodes: BIamOrganizationExpandTreeResponseVo[], level = 1, result: string[] = []): string[] => {
    if (level >= 2) return result

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
    if (organizationTreeRef.value && props.organizationTree) {
      // 清除过滤状态
      organizationTreeRef.value.filter('')

      organizationTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)

      if (state.form.parentId) {
        nextTick(() => {
          organizationTreeRef.value?.setCurrentKey(state.form.parentId)
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
    state.form.parentId = row.parentId
    state.organizationTreeOptions = props.organizationTree ? [props.organizationTree] : []

    // 计算并存储默认展开的keys
    state.defaultExpandedKeys = props.organizationTree ? getFirstTwoLevelNodeIds([props.organizationTree]) : []

    state.organizationQuery = ''
    state.currentSelectedNode = null
    state.visible = true

    // DOM更新后设置初始状态
    nextTick(() => {
      resetTreeState()
    })
  }

  /**
   * 处理组织树搜索输入变化
   */
  const onOrganizationQueryChanged = () => {
    if (!organizationTreeRef.value) return

    const query = state.organizationQuery.trim()
    organizationTreeRef.value.filter(query)

    // 如果搜索条件为空，恢复默认展开状态
    if (query === '') {
      organizationTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)
    }
  }

  /**
   * 组织树节点过滤方法
   */
  const organizationFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  /**
   * 处理树节点点击事件
   */
  const handleNodeClick = (node: BIamOrganizationExpandTreeResponseVo) => {
    // 不能选择自己作为父节点
    if (node.id === state.form.id) {
      ElMessage.warning('不能选择当前组织作为父节点')
      return
    }

    state.form.parentId = node.id
    state.currentSelectedNode = node
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

    state.organizationQuery = ''
    state.currentSelectedNode = null
    state.defaultExpandedKeys = []

    state.loading = false

    nextTick(() => {
      if (organizationTreeRef.value) {
        organizationTreeRef.value.filter('')
        organizationTreeRef.value.setCurrentKey('')
      }
    })
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    if (!state.form.parentId) {
      ElMessage.warning('请选择父节点')
      return
    }

    try {
      state.loading = true
      await BIamOrganizationApi.updateParent({
        id: state.form.id,
        parentId: state.form.parentId
      })
      ElMessage.success('父节点修改成功')
      state.visible = false
      emit('success')
    } catch (error) {
      console.error('修改父节点失败', error)
    } finally {
      state.loading = false
    }
  }

  const emit = defineEmits(['success'])
  defineExpose({ open })
</script>

<style scoped lang="scss">
  .organization-tree {
    width: 100%;
    margin-top: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    /* 深度选择器修改树节点样式 */
    :deep(.el-tree-v2__node) {
      padding: 5px 0;

      /* 当前选中节点样式 */
      &.is-current {
        > .el-tree-v2__node-content {
          background-color: #f5f7fa;
        }
      }
    }

    /* 树节点内容区域样式 */
    :deep(.el-tree-v2__node-content) {
      height: 36px;
      padding: 0 10px;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  /* 搜索输入框样式 */
  .el-input {
    margin-bottom: 10px;
  }
</style>
