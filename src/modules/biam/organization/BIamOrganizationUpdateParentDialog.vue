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
      <el-form-item label="当前组织:">
        <el-input v-model="state.form.currentName" disabled />
      </el-form-item>

      <el-form-item label="父节点:" prop="parentId" required>
        <TreePickerPanel
          v-model="state.form.parentId"
          :roots="treeRoots"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前组织或其下级组织作为父节点"
          placeholder="输入组织名称或编码搜索"
          :icon="OfficeBuilding"
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
  import { reactive, computed, type PropType } from 'vue'
  import { ElMessage } from 'element-plus'
  import { OfficeBuilding } from '@element-plus/icons-vue'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { BIamOrganizationExpandTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'

  const props = defineProps({
    organizationTree: {
      type: Object as PropType<BIamOrganizationExpandTreeResponseVo | null>,
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

  const treeRoots = computed(() => (props.organizationTree ? [props.organizationTree] : []))

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
      await BIamOrganizationApi.updateParent({
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
