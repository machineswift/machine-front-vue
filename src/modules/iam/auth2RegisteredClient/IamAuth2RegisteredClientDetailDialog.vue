<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="客户端详情"
    v-loading="state.loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="550px"
    top="15vh"
  >
    <el-form :model="state.detailData" label-width="120px">
      <el-form-item label="客户端ID">
        <el-input :model-value="state.detailData.clientId" disabled />
      </el-form-item>

      <el-form-item label="客户端名称">
        <el-input :model-value="state.detailData.clientName" disabled />
      </el-form-item>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-form-item label="作用域">
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
          <el-tag v-for="scope in state.detailData.scopes" :key="scope" type="info" effect="plain">
            {{ scope }}
          </el-tag>
          <span v-if="!state.detailData.scopes?.length" class="empty-text">无</span>
        </div>
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
          <el-form-item label="修改时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive } from 'vue'
  import { IamAuth2RegisteredClientApi } from '@/modules/iam/auth2RegisteredClient/api/IamAuth2RegisteredClient.api'
  import type { IamAuth2RegisteredClientDetailResponseVo } from '@/modules/iam/auth2RegisteredClient/type/IamAuth2RegisteredClient.type'

  const DEFAULT_DETAIL_DATA: IamAuth2RegisteredClientDetailResponseVo = {
    id: '',
    status: '',
    clientId: '',
    clientName: '',
    scopes: [],
    createBy: '',
    createName: '',
    createTime: 0,
    updateBy: '',
    updateName: '',
    updateTime: 0
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    clientId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    detailData: { ...DEFAULT_DETAIL_DATA, scopes: [...DEFAULT_DETAIL_DATA.scopes] } as IamAuth2RegisteredClientDetailResponseVo
  })

  const formatTime = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

  const handleDialogClosed = () => {
    state.detailData = { ...DEFAULT_DETAIL_DATA, scopes: [...DEFAULT_DETAIL_DATA.scopes] }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await IamAuth2RegisteredClientApi.detail({ id: props.clientId })
      state.detailData = {
        ...res,
        scopes: res.scopes || []
      }
    } catch (error) {
      console.error('获取客户端详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    [() => props.modelValue, () => props.clientId],
    ([newVisible, newClientId]) => {
      if (newVisible && newClientId) {
        fetchData()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .empty-text {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }
</style>
