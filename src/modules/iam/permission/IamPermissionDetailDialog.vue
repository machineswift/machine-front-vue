<template>
  <el-dialog
    v-model="state.visible"
    title="权限详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <div class="detail-container">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="权限名称" :span="2">
              {{ state.detailData.name }}
            </el-descriptions-item>

            <el-descriptions-item label="权限编码">
              {{ state.detailData.code }}
            </el-descriptions-item>

            <el-descriptions-item label="权限类型">
              <el-tag :type="getResourceTypeTag(state.detailData.resourceType)">
                {{ enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', state.detailData.resourceType)?.message || '-' }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="图标">
              {{ state.detailData.icon || '-' }}
            </el-descriptions-item>

            <el-descriptions-item label="排序">
              {{ state.detailData.sort || '-' }}
            </el-descriptions-item>

            <el-descriptions-item label="创建人">
              {{ state.detailData.createName }}
            </el-descriptions-item>

            <el-descriptions-item label="修改人">
              {{ state.detailData.updateName }}
            </el-descriptions-item>

            <el-descriptions-item label="创建时间">
              {{ formatTime(state.detailData.createTime) }}
            </el-descriptions-item>

            <el-descriptions-item label="更新时间">
              {{ formatTime(state.detailData.updateTime) }}
            </el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">
              {{ state.detailData.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 数据权限部分 -->
          <div v-if="state.detailData.resourceType === 'MENU' && state.detailData.dataPermissionMetaList?.length" class="data-permission-section">
            <h3>数据权限</h3>
            <IamPermissionDataPermissionScope v-model="state.detailData.dataPermissionMetaList" :disabled="true" />
          </div>
        </div>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { IamPermissionDetailResponseVo } from '@/modules/iam/permission/type/IamPermission.type'
  import IamPermissionDataPermissionScope from '@/modules/iam/permission/IamPermissionDataPermissionScope.vue'

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
    detailData: {} as IamPermissionDetailResponseVo
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
      const res = await IamPermissionApi.detail({ id: props.permissionId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取权限详情失败', error)
      state.detailData = {}
    } finally {
      state.loading = false
    }
  }

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    // 重置详情数据
    state.detailData = {} as IamPermissionDetailResponseVo
    // 重置加载状态
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

<style scoped lang="scss">
  .detail-container {
    .el-descriptions {
      margin-bottom: 20px;

      :deep(.el-descriptions__body) {
        background-color: #fafafa;
      }
    }

    .data-permission-section {
      margin-top: 20px;
      padding: 15px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      background-color: #fafafa;

      h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #606266;
      }
    }
  }
</style>
