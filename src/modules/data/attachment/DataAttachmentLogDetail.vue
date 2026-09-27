<template>
  <el-dialog
    v-model="state.visible"
    title="附件操作日志详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="55%"
    top="6vh"
  >
    <el-form :model="state.detailData" label-width="120px" v-loading="state.loading">
      <el-divider content-position="left">操作主体</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户ID">
            <el-input :model-value="state.detailData.userId || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input :model-value="state.detailData.username || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input :model-value="state.detailData.realName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input :model-value="state.detailData.phone || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">附件信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="附件ID">
            <el-input :model-value="state.detailData.attachmentId || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本ID">
            <el-input :model-value="state.detailData.versionId || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="附件分组">
            <el-input :model-value="state.detailData.attachmentGroup || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">业务实体</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="业务实体">
            <el-tag>{{ state.detailData.moduleEntity ? enumStore.getEnumLabel(DICT_MODULE_ENTITY, state.detailData.moduleEntity) : '无' }}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务实体ID">
            <el-input :model-value="state.detailData.moduleEntityId || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="业务实体名称">
            <el-input :model-value="state.detailData.moduleEntityName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作来源">
            <el-tag>{{ state.detailData.operateSource ? enumStore.getEnumLabel(DICT_OPERATE_SOURCE, state.detailData.operateSource) : '无' }}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作模块">
            <el-tag>{{ state.detailData.module ? enumStore.getEnumLabel(DICT_MODULE, state.detailData.module) : '无' }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作类型">
            <el-tag>
              {{ state.detailData.operationType ? enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_TYPE, state.detailData.operationType) : '无' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">请求链路</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="链路追踪ID">
            <el-input :model-value="state.detailData.traceId || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户端IP">
            <el-input :model-value="state.detailData.clientIp || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="平台">
            <el-input :model-value="state.detailData.platform || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="User Agent" v-if="state.detailData.userAgent">
        <el-input :model-value="state.detailData.userAgent" type="textarea" :rows="2" disabled />
      </el-form-item>

      <el-divider content-position="left">操作结果</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作结果">
            <el-tag :type="operationResultTagType(state.detailData.operationResult)">
              {{ state.detailData.operationResult ? enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_RESULT, state.detailData.operationResult) : '无' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="错误信息" v-if="state.detailData.errorMessage">
        <el-input :model-value="state.detailData.errorMessage" type="textarea" :rows="4" disabled />
      </el-form-item>

      <el-divider content-position="left">审计信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
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
  import { DataAttachmentLogApi } from '@/modules/data/attachment/api/DataAttachmentLog.api'
  import type { DataAttachmentLogDetailResponseVo } from '@/modules/data/attachment/type/DataAttachment.type'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import {
    DICT_MODULE,
    DICT_MODULE_ENTITY,
    DICT_OPERATE_SOURCE,
    DICT_DATA_ATTACHMENT_OPERATION_TYPE,
    DICT_DATA_ATTACHMENT_OPERATION_RESULT
  } from '@/shared/constants/DictionaryEnum.constant'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    logId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<DataAttachmentLogDetailResponseVo>
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 操作结果标签颜色
  const operationResultTagType = (result?: string): 'success' | 'danger' | 'warning' | 'info' => {
    if (result === 'SUCCESS') return 'success'
    if (result === 'FAILURE') return 'danger'
    if (result === 'PARTIAL') return 'warning'
    return 'info'
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  const fetchData = async () => {
    if (!props.logId) return

    try {
      state.loading = true
      const res = await DataAttachmentLogApi.detail({ id: props.logId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取附件操作日志详情失败', error)
      state.detailData = {}
    } finally {
      state.loading = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.logId],
    async ([modelValue, logId]) => {
      if (modelValue && logId) {
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
