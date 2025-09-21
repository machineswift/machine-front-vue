<template>
  <el-dialog
    v-model="state.visible"
    title="修改父节点"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="当前权限:">
        <el-input v-model="state.form.currentName" disabled />
      </el-form-item>
      <el-form-item label="新父节点:" prop="parentId" required>
        <el-input v-model="state.permissionQuery" placeholder="请输入关键字筛选" clearable @input="onPermissionQueryChanged" />
        <el-tree-v2
          ref="permissionTreeRef"
          :data="state.permissionTreeOptions"
          :props="state.permissionProps"
          :filter-method="permissionFilterMethod"
          :height="320"
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
          class="permission-tree"
        >
          <template #default="{ node }">
            <span>{{ node.data.name }}</span>
            <span class="node-code">({{ node.data.code }})</span>
          </template>
        </el-tree-v2>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.loading"
        :disabled="!state.form.parentId"
        v-hasPermission="['SYSTEM:AUTH:PERMISSION:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElTreeV2, ElMessage } from 'element-plus'
  import { reactive, ref, nextTick, type PropType } from 'vue'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import type { IamPermissionTreeExpandResponseVo } from '@/modules/iam/types'

  const props = defineProps({
    permissionTree: {
      type: Object as PropType<IamPermissionTreeExpandResponseVo | null>,
      required: false,
      default: () => ({ children: [] })
    }
  })

  const permissionTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  // 组件状态
  const state = reactive({
    loading: false,
    visible: false,
    permissionQuery: '',
    permissionTreeOptions: [] as IamPermissionTreeExpandResponseVo[],
    permissionProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    form: {
      id: '',
      currentName: '',
      parentId: ''
    },
    currentSelectedNode: null as IamPermissionTreeExpandResponseVo | null,
    // 新增状态，用于存储默认展开的keys
    defaultExpandedKeys: [] as string[]
  })

  /**
   * 获取前两层节点的ID
   */
  const getFirstTwoLevelNodeIds = (nodes: IamPermissionTreeExpandResponseVo[], level = 1, result: string[] = []): string[] => {
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
    if (permissionTreeRef.value && props.permissionTree) {
      // 清除过滤状态
      permissionTreeRef.value.filter('')

      // 重置展开状态
      permissionTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)

      // 重置选中状态
      if (state.form.parentId) {
        nextTick(() => {
          permissionTreeRef.value?.setCurrentKey(state.form.parentId)
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
    state.permissionTreeOptions = props.permissionTree ? [props.permissionTree] : []

    // 计算并存储默认展开的keys
    state.defaultExpandedKeys = props.permissionTree ? getFirstTwoLevelNodeIds([props.permissionTree]) : []

    // 重置搜索条件
    state.permissionQuery = ''
    state.currentSelectedNode = null
    state.visible = true

    // DOM更新后设置初始状态
    nextTick(() => {
      resetTreeState()
    })
  }

  /**
   * 处理权限树搜索输入变化
   */
  const onPermissionQueryChanged = () => {
    if (!permissionTreeRef.value) return

    const query = state.permissionQuery.trim()
    permissionTreeRef.value.filter(query)

    // 如果搜索条件为空，恢复默认展开状态
    if (query === '') {
      permissionTreeRef.value.setExpandedKeys(state.defaultExpandedKeys)
    }
  }

  /**
   * 权限树节点过滤方法
   */
  const permissionFilterMethod = (query: string, node: IamPermissionTreeExpandResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || node.code?.toLowerCase().includes(query.toLowerCase()) || false
  }

  /**
   * 处理树节点点击事件
   */
  const handleNodeClick = (node: IamPermissionTreeExpandResponseVo) => {
    // 不能选择自己作为父节点
    if (node.id === state.form.id) {
      ElMessage.warning('不能选择当前权限作为父节点')
      return
    }

    state.form.parentId = node.id
    state.currentSelectedNode = node
  }

  /**
   * 处理对话框关闭事件
   */
  const handleDialogClosed = () => {
    // 重置表单数据
    state.form = {
      id: '',
      currentName: '',
      parentId: ''
    }

    // 重置其他状态
    state.permissionQuery = ''
    state.currentSelectedNode = null
    state.loading = false

    // 重置树形控件状态
    if (permissionTreeRef.value) {
      permissionTreeRef.value.filter('')
    }
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
      await IamPermissionApi.updateParent({
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
  .permission-tree {
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

  .node-code {
    margin-left: 8px;
    color: #999;
    font-size: 12px;
  }
</style>
