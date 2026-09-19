<template>
  <el-dialog
    v-model="uiState.visible"
    title="修改父区域"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="8vh"
  >
    <el-form :model="form" label-width="90px">
      <el-form-item label="当前区域:">
        <el-input v-model="form.currentName" disabled />
      </el-form-item>

      <el-form-item label="父区域:" prop="parentId" required>
        <TreePickerPanel
          v-model="form.parentId"
          :roots="treeRoots"
          :exclude-id="form.id"
          exclude-message="不能选择当前区域或其下级区域作为父区域"
          placeholder="输入区域名称或编码搜索"
          :icon="Location"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="uiState.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="uiState.loading"
        :disabled="!form.parentId"
        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, type PropType } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Location } from '@element-plus/icons-vue'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { DataAreaExpandTreeResponseVo } from '@/modules/data/area/type/DataArea.type'

  const props = defineProps({
    areaTree: {
      type: Object as PropType<DataAreaExpandTreeResponseVo | null>,
      default: null
    }
  })

  const emit = defineEmits(['success'])

  const uiState = reactive({
    visible: false,
    loading: false
  })

  const form = reactive({
    id: '',
    currentName: '',
    parentId: ''
  })

  const treeRoots = computed(() => (props.areaTree ? [props.areaTree] : []))

  const open = (row: { id: string; name: string; parentId: string }) => {
    form.id = row.id
    form.currentName = row.name
    form.parentId = row.parentId
    uiState.visible = true
  }

  const handleDialogClosed = () => {
    form.id = ''
    form.currentName = ''
    form.parentId = ''
    uiState.loading = false
  }

  const handleSubmit = async () => {
    if (!form.parentId) {
      ElMessage.warning('请选择一个父区域')
      return
    }

    try {
      uiState.loading = true
      await DataAreaApi.updateParent({
        id: form.id,
        parentId: form.parentId
      })
      ElMessage.success('父区域修改成功')
      uiState.visible = false
      emit('success')
    } catch (error) {
      console.error('修改父区域失败', error)
    } finally {
      uiState.loading = false
    }
  }

  defineExpose({ open })
</script>
