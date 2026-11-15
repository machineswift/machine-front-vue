<template>
  <el-dialog
    v-model="state.visible"
    title="移动类目"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-alert title="关联后台分类的类目不能作为父类目" type="info" show-icon :closable="false" class="parent-alert" />

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
      <el-button :disabled="state.loading" @click="state.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.loading"
        :disabled="!state.form.parentId"
        v-hasPermission="['MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { ScmFrontCategoryTreeExpandResponseVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'

  const props = defineProps<{ categoryTree?: ScmFrontCategoryTreeExpandResponseVo | null }>()

  const emit = defineEmits(['success'])

  const emptyForm = () => ({ id: '', currentName: '', parentId: '' })

  const state = reactive({
    loading: false,
    visible: false,
    form: emptyForm()
  })

  // 完整展示分类树：已关联后台分类的类目不能作为父类目
  const treeRoots = computed(() => (props.categoryTree ? [props.categoryTree] : []))

  /** 打开对话框并初始化数据 */
  const open = (row: { id: string; name: string; parentId: string }) => {
    state.form = { id: row.id, currentName: row.name, parentId: '' }
    state.visible = true
  }

  /** 提交移动（未选目标父类目时按钮已置灰，无需再校验） */
  const handleSubmit = async () => {
    try {
      state.loading = true
      await ScmFrontCategoryApi.updateParent({
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
    } finally {
      state.loading = false
    }
  }

  /** 对话框关闭时清理数据 */
  const handleDialogClosed = () => {
    state.form = emptyForm()
    state.loading = false
  }

  defineExpose({ open })
</script>

<style scoped lang="scss">
  .parent-alert {
    margin-bottom: 12px;
  }
</style>
