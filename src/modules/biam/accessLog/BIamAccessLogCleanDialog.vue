<template>
  <el-dialog
    v-model="state.visible"
    title="清理访问日志"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="480px"
    top="22vh"
  >
    <el-form label-width="120px">
      <el-form-item label="时间节点">
        <el-date-picker v-model="state.beforeTime" type="datetime" placeholder="选择时间节点" value-format="x" style="width: 100%" />
      </el-form-item>
    </el-form>

    <el-alert type="warning" :closable="false" show-icon title="将删除该时间节点之前的所有访问日志，删除后不可恢复，请谨慎操作。" />

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="danger" :loading="state.loading" @click="handleConfirm">确定清理</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { BIamUserAccessLogApi } from '@/modules/biam/accessLog/api/BIamUserAccessLog.api'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    // 默认清理时间节点：当前时间
    beforeTime: Date.now() as number | null
  })

  const handleDialogClosed = () => {
    state.loading = false
    state.beforeTime = Date.now()
  }

  const handleConfirm = async () => {
    if (!state.beforeTime) {
      ElMessage.warning('请选择清理时间节点')
      return
    }

    try {
      state.loading = true
      const count = await BIamUserAccessLogApi.deleteLog({ beforeCreateTime: state.beforeTime })
      ElMessage.success(`清理成功，共删除 ${count} 条访问日志`)
      state.visible = false
      emit('success')
    } catch (error) {
      console.error('清理访问日志失败', error)
    } finally {
      state.loading = false
    }
  }

  // 打开对话框时重置默认时间节点
  watch(
    () => props.modelValue,
    val => {
      if (val) {
        state.beforeTime = Date.now()
      }
    }
  )
</script>

<style lang="scss" scoped></style>
