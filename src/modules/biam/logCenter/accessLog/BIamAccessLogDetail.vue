<template>
  <el-dialog
    v-model="state.visible"
    title="访问日志详情"
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
        <el-descriptions-item label="用户名">{{ state.detailData.username || '无' }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ state.detailData.realName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ state.detailData.phone || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="操作来源">
          <el-tag>{{ state.detailData.operateSource ? enumStore.getEnumLabel(DICT_OPERATE_SOURCE, state.detailData.operateSource) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作模块">
          <el-tag>{{ state.detailData.module ? enumStore.getEnumLabel(DICT_MODULE, state.detailData.module) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作模块实体">
          <el-tag>
            {{ state.detailData.moduleEntity ? enumStore.getEnumLabel(DICT_MODULE_ENTITY, state.detailData.moduleEntity) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作分类">
          <el-tag>{{ state.detailData.operateType ? enumStore.getEnumLabel(DICT_ACTION_TYPE, state.detailData.operateType) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作名称" :span="2">{{ state.detailData.operateName || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 请求链路 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="请求链路">
        <el-descriptions-item label="链路追踪ID">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.traceId }">{{ state.detailData.traceId || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ state.detailData.clientIp || '无' }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ state.detailData.platform || '无' }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.deviceId }">{{ state.detailData.deviceId || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.userAgent" label="User Agent" :span="2">
          <span class="detail-text-break">{{ state.detailData.userAgent }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- HTTP 请求 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="HTTP 请求">
        <el-descriptions-item label="HTTP方法">{{ state.detailData.httpMethod || '无' }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.requestPath }">{{ state.detailData.requestPath || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.queryString" label="QueryString" :span="2">
          <span class="detail-text-break">{{ state.detailData.queryString }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.requestBody" label="请求体" :span="2">
          <pre class="detail-code">{{ state.detailData.requestBody }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <!-- HTTP 响应 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="HTTP 响应">
        <el-descriptions-item label="HTTP状态码">{{ state.detailData.httpStatus != null ? String(state.detailData.httpStatus) : '无' }}</el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.responseBody" label="响应体" :span="2">
          <pre class="detail-code">{{ state.detailData.responseBody }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作结果 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作结果">
        <el-descriptions-item label="业务状态">
          <el-tag :type="state.detailData.actionStatus === 'SUCCESS' ? 'success' : 'danger'">
            {{ state.detailData.actionStatus ? enumStore.getEnumLabel(DICT_ACTION_STATUS, state.detailData.actionStatus) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="业务错误码">{{ state.detailData.errorCode || '无' }}</el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.errorMessage" label="错误信息" :span="2">
          <span class="detail-text-break">{{ state.detailData.errorMessage }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.exceptionStack" label="异常堆栈" :span="2">
          <pre class="detail-code">{{ state.detailData.exceptionStack }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 性能信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="性能信息">
        <el-descriptions-item label="耗时(ms)">{{ state.detailData.costTime != null ? String(state.detailData.costTime) : '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 审计信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="审计信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { BIamUserAccessLogApi } from '@/modules/biam/logCenter/accessLog/api/BIamUserAccessLog.api'
  import type { BIamUserAccessLogDetailResponseVo } from '@/modules/biam/logCenter/accessLog/type/IamUserAccessLog.type'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_MODULE, DICT_MODULE_ENTITY, DICT_OPERATE_SOURCE, DICT_ACTION_TYPE, DICT_ACTION_STATUS } from '@/shared/constants/DictionaryEnum.constant'

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
    detailData: {} as Partial<BIamUserAccessLogDetailResponseVo>
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
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
      const res = await BIamUserAccessLogApi.detail({ id: props.logId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取访问日志详情失败', error)
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
