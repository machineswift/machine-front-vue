<template>
  <el-dialog
    v-model="state.visible"
    title="权限详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="权限名称" :span="2">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="权限编码" :span="2">
          <span class="detail-text-break">{{ state.detailData.code || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="权限类型">
          <el-tag :type="getResourceTypeTag(state.detailData.resourceType)">
            {{ state.detailData.resourceType ? enumStore.getEnumLabel(DICT_IAM_PERMISSION_RESOURCE_TYPE, state.detailData.resourceType) : '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="图标">{{ state.detailData.icon || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" v-if="state.detailData.description" :span="2">
          <span class="detail-text-break">{{ state.detailData.description }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="数据权限" v-if="state.detailData.resourceType === 'MENU' && state.detailData.dataPermissionMetaList?.length" :span="2">
          <BIamPermissionDataPermissionScope v-model="state.detailData.dataPermissionMetaList" :disabled="true" />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { BIamPermissionApi } from '@/modules/biam/accessControl/permission/api/BIamPermission.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_PERMISSION_RESOURCE_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import type { BIamPermissionDetailResponseVo } from '@/modules/biam/accessControl/permission/type/BIamPermission.type'
  import BIamPermissionDataPermissionScope from '@/modules/biam/accessControl/permission/BIamPermissionDataPermissionScope.vue'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    permissionId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])
  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as BIamPermissionDetailResponseVo
  })

  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const getResourceTypeTag = (type?: string) => {
    const typeMap: Record<string, string> = {
      MENU: 'primary',
      BUTTON: 'info',
      API: 'warning',
      DATA: 'success'
    }
    return type ? typeMap[type] || 'primary' : 'primary'
  }

  const fetchData = async () => {
    if (!props.permissionId) return

    try {
      state.loading = true
      const res = await BIamPermissionApi.detail({ id: props.permissionId })
      state.detailData = (res || {}) as BIamPermissionDetailResponseVo
    } catch (error) {
      console.error('获取权限详情失败', error)
      state.detailData = {} as BIamPermissionDetailResponseVo
    } finally {
      state.loading = false
    }
  }

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    state.detailData = {} as BIamPermissionDetailResponseVo
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.permissionId],
    async ([modelValue, permissionId]) => {
      if (modelValue && permissionId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
