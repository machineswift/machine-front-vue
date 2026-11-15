<template>
  <el-dialog
    v-model="state.visible"
    title="附件操作日志详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 操作主体 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作主体">
        <el-descriptions-item label="用户ID">{{ state.detailData.userId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ state.detailData.username || '无' }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ state.detailData.realName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ state.detailData.phone || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 附件信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="附件信息">
        <el-descriptions-item label="附件ID">{{ state.detailData.attachmentId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="版本ID">{{ state.detailData.versionId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="附件分组">{{ state.detailData.attachmentGroup || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 业务实体 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="业务实体">
        <el-descriptions-item label="业务实体">
          <el-tag>{{ state.detailData.moduleEntity ? enumStore.getEnumLabel(DICT_MODULE_ENTITY, state.detailData.moduleEntity) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="业务实体ID">{{ state.detailData.moduleEntityId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="业务实体名称">{{ state.detailData.moduleEntityName || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="操作来源">
          <el-tag>{{ state.detailData.operateSource ? enumStore.getEnumLabel(DICT_OPERATE_SOURCE, state.detailData.operateSource) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作模块">
          <el-tag>{{ state.detailData.module ? enumStore.getEnumLabel(DICT_MODULE, state.detailData.module) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag>
            {{ state.detailData.operationType ? enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_TYPE, state.detailData.operationType) : '无' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 请求链路 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="请求链路">
        <el-descriptions-item label="链路追踪ID">{{ state.detailData.traceId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ state.detailData.clientIp || '无' }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ state.detailData.platform || '无' }}</el-descriptions-item>
        <el-descriptions-item label="User Agent" :span="2" v-if="state.detailData.userAgent">
          <span class="detail-text-break">{{ state.detailData.userAgent }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作结果 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作结果">
        <el-descriptions-item label="操作结果">
          <el-tag :type="operationResultTagType(state.detailData.operationResult)">
            {{ state.detailData.operationResult ? enumStore.getEnumLabel(DICT_DATA_ATTACHMENT_OPERATION_RESULT, state.detailData.operationResult) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="state.detailData.errorMessage">
          <span class="detail-text-break">{{ state.detailData.errorMessage }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审计信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="审计信息">
        <el-descriptions-item label="操作人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

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
