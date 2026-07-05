<template>
  <el-dialog
    v-model="state.visible"
    title="权限详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="5vh"
  >
    <el-form :model="state.detailData" label-width="100px" v-loading="state.loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="权限名称">
            <el-input :model-value="state.detailData.name || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限编码">
            <el-input :model-value="state.detailData.code || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="权限类型">
            <el-tag :type="getResourceTypeTag(state.detailData.resourceType)">
              {{ enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', state.detailData.resourceType)?.message || '-' }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标">
            <el-input :model-value="state.detailData.icon || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="排序">
        <el-input :model-value="state.detailData.sort ?? '-'" disabled style="width: 200px" />
      </el-form-item>

      <el-form-item label="备注" v-if="state.detailData.description">
        <el-input :model-value="state.detailData.description" type="textarea" :rows="3" disabled />
      </el-form-item>

      <!-- 数据权限 -->
      <el-form-item label="数据权限" v-if="state.detailData.resourceType === 'MENU' && state.detailData.dataPermissionMetaList?.length">
        <IamPermissionDataPermissionScope v-model="state.detailData.dataPermissionMetaList" :disabled="true" />
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
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

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
