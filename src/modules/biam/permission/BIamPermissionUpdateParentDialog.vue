<template>
  <el-dialog
    v-model="state.visible"
    title="移动"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="8vh"
  >
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="当前权限:">
        <el-input v-model="state.form.currentName" disabled />
      </el-form-item>

      <el-form-item label="父节点:" prop="parentId" required>
        <TreePickerPanel
          v-model="state.form.parentId"
          :roots="treeRoots"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前权限或其下级权限作为父节点"
          placeholder="输入权限名称或编码搜索"
          :icon="Key"
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
        v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, type PropType } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Key } from '@element-plus/icons-vue'
  import { BIamPermissionApi } from '@/modules/biam/permission/api/BIamPermission.api'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { BIamPermissionTreeExpandResponseVo } from '@/modules/biam/permission/type/BIamPermission.type'

  const props = defineProps({
    permissionTree: {
      type: Object as PropType<BIamPermissionTreeExpandResponseVo | null>,
      required: false,
      default: () => ({ children: [] })
    }
  })

  const emit = defineEmits(['success'])

  // 组件状态
  const state = reactive({
    loading: false,
    visible: false,
    form: {
      id: '',
      currentName: '',
      parentId: ''
    }
  })

  const treeRoots = computed(() => (props.permissionTree ? [props.permissionTree] : []))

  /**
   * 打开对话框并初始化数据
   */
  const open = (row: { id: string; name: string; parentId: string }) => {
    state.form.id = row.id
    state.form.currentName = row.name
    state.form.parentId = row.parentId
    state.visible = true
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

    state.loading = false
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
      await BIamPermissionApi.updateParent({
        id: state.form.id,
        parentId: state.form.parentId
      })
      ElMessage.success('父节点修改成功')
      state.visible = false
      emit('success')
    } catch (error) {
      console.error('移动失败', error)
    } finally {
      state.loading = false
    }
  }

  defineExpose({ open })
</script>
