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
    top="8vh"
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
        <TreePickerPanel
          v-model="state.form.parentId"
          :roots="treeRoots"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前类目或其下级类目作为父类目"
          :icon="FolderOpened"
          placeholder="输入类目名称或编码搜索"
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
        v-hasPermission="['MANAGE_APP:SCM:CATEGORY:BACK:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, type PropType } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps({
    categoryTree: {
      type: Object as PropType<ScmBackCategoryTreeSimpleResponseVo | null>,
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

  const treeRoots = computed(() => (props.categoryTree ? [props.categoryTree] : []))

  /**
   * 打开对话框并初始化数据
   */
  const open = (row: { id: string; name: string; parentId: string }) => {
    state.form.id = row.id
    state.form.currentName = row.name
    state.form.parentId = ''
    state.visible = true
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
    state.loading = false
  }

  defineExpose({ open })
</script>
