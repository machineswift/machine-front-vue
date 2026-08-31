<template>
  <el-dialog
    v-model="state.visible"
    title="访问日志详情"
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
          <el-form-item label="用户名">
            <el-input :model-value="state.detailData.username || '无'" disabled />
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
          <el-form-item label="操作模块实体">
            <el-tag>
              {{ state.detailData.moduleEntity ? enumStore.getEnumLabel(DICT_MODULE_ENTITY, state.detailData.moduleEntity) : '无' }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作分类">
            <el-tag>{{ state.detailData.operateType ? enumStore.getEnumLabel(DICT_ACTION_TYPE, state.detailData.operateType) : '无' }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作名称">
            <el-input :model-value="state.detailData.operateName || '无'" disabled />
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
        <el-col :span="12">
          <el-form-item label="设备ID">
            <el-input :model-value="state.detailData.deviceId || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="User Agent" v-if="state.detailData.userAgent">
        <el-input :model-value="state.detailData.userAgent" type="textarea" :rows="2" disabled />
      </el-form-item>

      <el-divider content-position="left">HTTP 请求</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="HTTP方法">
            <el-input :model-value="state.detailData.httpMethod || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="请求路径">
            <el-input :model-value="state.detailData.requestPath || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="QueryString" v-if="state.detailData.queryString">
        <el-input :model-value="state.detailData.queryString" type="textarea" :rows="2" disabled />
      </el-form-item>

      <el-form-item label="请求体" v-if="state.detailData.requestBody">
        <el-input :model-value="state.detailData.requestBody" type="textarea" :rows="4" disabled />
      </el-form-item>

      <el-divider content-position="left">HTTP 响应</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="HTTP状态码">
            <el-input :model-value="state.detailData.httpStatus != null ? String(state.detailData.httpStatus) : '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="响应体" v-if="state.detailData.responseBody">
        <el-input :model-value="state.detailData.responseBody" type="textarea" :rows="4" disabled />
      </el-form-item>

      <el-divider content-position="left">操作结果</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="业务状态">
            <el-tag :type="state.detailData.actionStatus === 'SUCCESS' ? 'success' : 'danger'">
              {{ state.detailData.actionStatus ? enumStore.getEnumLabel(DICT_ACTION_STATUS, state.detailData.actionStatus) : '无' }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务错误码">
            <el-input :model-value="state.detailData.errorCode || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="错误信息" v-if="state.detailData.errorMessage">
        <el-input :model-value="state.detailData.errorMessage" type="textarea" :rows="2" disabled />
      </el-form-item>

      <el-form-item label="异常堆栈" v-if="state.detailData.exceptionStack">
        <el-input :model-value="state.detailData.exceptionStack" type="textarea" :rows="6" disabled />
      </el-form-item>

      <el-divider content-position="left">性能信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="耗时(ms)">
            <el-input :model-value="state.detailData.costTime != null ? String(state.detailData.costTime) : '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">审计信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新人">
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
  import { BIamUserAccessLogApi } from '@/modules/biam/accessLog/api/BIamUserAccessLog.api'
  import type { BIamUserAccessLogDetailResponseVo } from '@/modules/biam/accessLog/type/IamUserAccessLog.type'
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

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
