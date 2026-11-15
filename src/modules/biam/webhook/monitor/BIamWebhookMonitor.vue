<template>
  <div class="webhook-monitor-page-div">
    <div class="webhook-monitor-main-content">
      <!-- 监控筛选 -->
      <el-card class="box-card-filter">
        <template v-if="canViewStatistics">
          <div class="filter-row">
            <span class="filter-label">统计区间</span>
            <el-radio-group v-model="state.presetMillis" class="preset-group" @change="handlePresetChange">
              <el-radio-button v-for="preset in WEBHOOK_MONITOR_TIME_PRESETS" :key="preset.millis" :value="preset.millis">
                {{ preset.label }}
              </el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="state.customRange"
              class="time-picker"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="x"
              :clearable="false"
              @change="handleCustomRangeChange"
            />
          </div>
        </template>

        <div class="filter-row">
          <template v-if="canViewStatistics">
            <el-select v-model="state.filter.webhookEndpointId" class="filter-item" placeholder="全部接收端" clearable filterable @change="handleFilterChange">
              <el-option v-for="item in endpointOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>

            <el-select
              v-model="state.filter.eventCode"
              class="filter-item"
              placeholder="全部事件"
              clearable
              filterable
              allow-create
              default-first-option
              @change="handleFilterChange"
            >
              <el-option v-for="item in eventOptions" :key="item.code" :label="`${item.name}（${item.code}）`" :value="item.code" />
            </el-select>

            <el-button type="primary" :loading="state.overviewLoading || state.trendLoading" @click="fetchStatistics">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilter">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-divider direction="vertical" />
          </template>

          <div class="filter-actions">
            <el-select v-model="state.autoRefreshSeconds" class="auto-refresh-select" @change="handleAutoRefreshChange">
              <template #prefix>
                <el-icon><Timer /></el-icon>
              </template>
              <el-option :value="0" label="自动刷新：关闭" />
              <el-option :value="30" label="每 30 秒刷新" />
              <el-option :value="60" label="每 1 分钟刷新" />
              <el-option :value="300" label="每 5 分钟刷新" />
            </el-select>
            <el-button circle title="立即刷新" :loading="state.refreshing" @click="refreshAll">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <span class="refresh-tip">{{ lastRefreshText }}</span>
          </div>
        </div>
      </el-card>

      <!-- 运行概览 -->
      <div v-if="canViewOverview" v-loading="state.overviewLoading" class="kpi-grid">
        <div class="kpi-card kpi-card--primary">
          <div class="kpi-head">
            <span class="kpi-label">
              投递成功率
              <el-tooltip content="成功率 = 成功任务数 / 已结束任务数（成功 + 失败 + 过期 + 取消），待处理任务不计入分母" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <el-icon class="kpi-icon"><TrendCharts /></el-icon>
          </div>
          <div class="kpi-body">
            <el-progress class="kpi-ring" type="circle" :width="58" :stroke-width="6" :percentage="successRatePercent" :color="successRateColor">
              <template #default>
                <el-icon :size="18" :color="successRateColor"><TrendCharts /></el-icon>
              </template>
            </el-progress>
            <div class="kpi-value-group">
              <span class="kpi-value">{{ successRateText }}</span>
              <span class="kpi-sub">已结束 {{ formatNumber(finishedTaskCount) }} 条任务</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-card--success">
          <div class="kpi-head">
            <span class="kpi-label">
              任务总量
              <el-tooltip content="统计区间内创建的投递任务总数" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <el-icon class="kpi-icon"><Histogram /></el-icon>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ formatNumber(overview.totalTaskCount) }}</span>
            <span class="kpi-unit">条</span>
          </div>
          <div class="kpi-tags">
            <span class="kpi-tag is-success">成功 {{ formatNumber(overview.successTaskCount) }}</span>
            <span class="kpi-tag is-danger">失败 {{ formatNumber(overview.failedTaskCount) }}</span>
            <span class="kpi-tag">过期 {{ formatNumber(overview.expiredTaskCount) }}</span>
            <span class="kpi-tag">取消 {{ formatNumber(overview.cancelledTaskCount) }}</span>
            <span class="kpi-tag">暂停 {{ formatNumber(overview.pausedTaskCount) }}</span>
          </div>
        </div>

        <div
          class="kpi-card kpi-card--warning"
          :class="{ 'is-clickable': canViewEndpointMonitor }"
          :title="canViewEndpointMonitor ? '点击筛选存在待处理任务的接收端' : undefined"
          @click="drillDownEndpoints({ hasPendingTask: true })"
        >
          <div class="kpi-head">
            <span class="kpi-label">
              待处理积压
              <el-tooltip content="当前处于 PENDING 状态、等待投递的任务数（不受统计区间限制）" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <el-icon class="kpi-icon"><Timer /></el-icon>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ formatNumber(overview.pendingTaskCount) }}</span>
            <span class="kpi-unit">条</span>
          </div>
          <div class="kpi-sub-row">
            <span v-if="overview.oldestPendingTime" class="kpi-sub">
              最久等待 {{ formatMonitorDuration(overview.oldestPendingAgeSeconds) }}
              <el-tooltip :content="`最老待处理任务创建于 ${formatMonitorTime(overview.oldestPendingTime)}`" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <span v-else class="kpi-sub is-muted">当前无积压任务</span>
          </div>
        </div>

        <div
          class="kpi-card kpi-card--danger"
          :class="{ 'is-clickable': canViewEndpointMonitor }"
          :title="canViewEndpointMonitor ? '点击筛选熔断中的接收端' : undefined"
          @click="drillDownEndpoints({ circuitState: 'OPEN' })"
        >
          <div class="kpi-head">
            <span class="kpi-label">
              熔断接收端
              <el-tooltip content="熔断打开（OPEN）与半开（HALF_OPEN）的接收端数量，熔断期间暂停投递" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <el-icon class="kpi-icon"><Warning /></el-icon>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ formatNumber(circuitBrokenCount) }}</span>
            <span class="kpi-unit">个</span>
          </div>
          <div class="kpi-tags">
            <span class="kpi-tag is-danger">打开 {{ formatNumber(overview.openCircuitCount) }}</span>
            <span class="kpi-tag is-warning">半开 {{ formatNumber(overview.halfOpenCircuitCount) }}</span>
          </div>
        </div>

        <div class="kpi-card kpi-card--info">
          <div class="kpi-head">
            <span class="kpi-label">
              接收端
              <el-tooltip content="接收端启用、禁用与人工暂停投递的数量分布" placement="top">
                <el-icon class="kpi-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            <el-icon class="kpi-icon"><Link /></el-icon>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ formatNumber(overview.enabledEndpointCount) }}</span>
            <span class="kpi-unit">个启用</span>
          </div>
          <div class="kpi-tags">
            <span class="kpi-tag is-success">启用 {{ formatNumber(overview.enabledEndpointCount) }}</span>
            <span class="kpi-tag">禁用 {{ formatNumber(overview.disabledEndpointCount) }}</span>
            <span class="kpi-tag is-warning">暂停 {{ formatNumber(overview.pausedEndpointCount) }}</span>
          </div>
        </div>
      </div>

      <!-- 投递趋势 -->
      <el-card v-if="canViewTrend" class="box-card-trend">
        <div class="card-header">
          <div class="card-title">
            投递趋势
            <span class="card-title-tip">任务数按任务时间统计，HTTP 次数按执行记录统计，两种口径不可相加</span>
          </div>
          <el-radio-group v-model="state.trendInterval" size="small" @change="handleTrendIntervalChange">
            <el-radio-button value="">自动</el-radio-button>
            <el-radio-button v-for="option in trendIntervalOptions" :key="option.code" :value="option.code">
              {{ option.message }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="chart-legend">
          <button
            v-for="item in WEBHOOK_TREND_SERIES"
            :key="item.key"
            type="button"
            class="legend-item"
            :class="{ 'is-hidden': !state.visibleSeriesKeys.includes(item.key) }"
            @click="toggleSeries(item.key)"
          >
            <span class="legend-dot" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </button>
          <span class="legend-interval">统计粒度：{{ effectiveIntervalLabel }}</span>
        </div>

        <el-skeleton v-if="state.trendLoading && !state.trendPoints.length" class="chart-skeleton" :rows="5" animated />
        <BIamWebhookMonitorTrendChart
          v-else
          :points="state.trendPoints"
          :series="WEBHOOK_TREND_SERIES"
          :visible-keys="state.visibleSeriesKeys"
          :interval="state.trendIntervalResult"
          :height="300"
        />
      </el-card>

      <!-- 接收端健康度 -->
      <el-card v-if="canViewEndpointMonitor" ref="endpointCardRef" class="box-card-endpoint">
        <div class="card-header card-header--wrap">
          <div class="card-title">
            接收端健康度
            <span class="card-title-tip">按各接收端自身的失败统计窗口实时计算，与上方统计区间无关</span>
          </div>
          <div class="endpoint-filters">
            <el-input
              v-model="state.endpointFilter.webhookEndpointCode"
              class="endpoint-filter-item endpoint-filter-item--input"
              placeholder="接收端编码"
              clearable
              @keyup.enter="handleEndpointSearch"
              @clear="handleEndpointSearch"
            />
            <el-select
              v-model="state.endpointFilter.endpointStatus"
              class="endpoint-filter-item"
              placeholder="启用状态"
              clearable
              @change="handleEndpointSearch"
            >
              <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
            <el-select v-model="state.endpointFilter.pauseFlag" class="endpoint-filter-item" placeholder="投递状态" clearable @change="handleEndpointSearch">
              <el-option v-for="option in PAUSE_FILTER_OPTIONS" :key="String(option.value)" :label="option.label" :value="option.value" />
            </el-select>
            <el-select v-model="state.endpointFilter.circuitState" class="endpoint-filter-item" placeholder="熔断状态" clearable @change="handleEndpointSearch">
              <el-option v-for="option in circuitStateOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
            <el-select
              v-model="state.endpointFilter.hasPendingTask"
              class="endpoint-filter-item"
              placeholder="待处理任务"
              clearable
              @change="handleEndpointSearch"
            >
              <el-option v-for="option in PENDING_FILTER_OPTIONS" :key="String(option.value)" :label="option.label" :value="option.value" />
            </el-select>
            <el-button type="primary" @click="handleEndpointSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetEndpointFilter">重置</el-button>
          </div>
        </div>

        <el-table class="endpoint-table" v-loading="state.endpointLoading" :data="state.endpointTableData" row-key="webhookEndpointId" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="接收端" min-width="190">
            <template #default="{ row }">
              <div class="endpoint-cell">
                <el-tooltip :content="row.webhookEndpointName || row.webhookEndpointCode || '-'" placement="top" :append-to-body="true">
                  <span class="endpoint-name">{{ row.webhookEndpointName || row.webhookEndpointCode || '-' }}</span>
                </el-tooltip>
                <span class="endpoint-code">{{ row.webhookEndpointCode || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="启用状态" width="100" align="center">
            <template #header>
              <el-tooltip content="接收端配置是否生效：禁用后不再产生新投递任务并停止投递" placement="top">
                <span class="header-with-help">
                  启用状态
                  <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                </span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-tag size="small" effect="light" :type="row.endpointStatus === 'ENABLE' ? 'success' : 'danger'">
                {{ enumStore.getEnumLabel(DICT_STATUS, row.endpointStatus, '-') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投递状态" width="100" align="center">
            <template #header>
              <el-tooltip content="人工暂停开关：暂停后仅停止投递，接收端配置与未完成任务保留，恢复后继续投递" placement="top">
                <span class="header-with-help">
                  投递状态
                  <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                </span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-tag size="small" effect="light" :type="row.pauseFlag ? 'warning' : 'info'">{{ row.pauseFlag ? '暂停' : '正常' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="熔断状态" width="110" align="center">
            <template #default="{ row }">
              <el-tooltip :content="circuitTooltip(row)" placement="top" :append-to-body="true">
                <el-tag size="small" effect="dark" :type="WEBHOOK_CIRCUIT_STATE_TAG_TYPE[row.circuitState] || 'info'">
                  {{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, row.circuitState, '-') }}
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="窗口请求" width="100" align="center">
            <template #default="{ row }">{{ formatNumber(row.requestCount) }}</template>
          </el-table-column>
          <el-table-column label="窗口失败率" width="170" align="center">
            <template #default="{ row }">
              <el-tooltip
                :content="`窗口内失败 ${formatNumber(row.failureCount)} 次 / 请求 ${formatNumber(row.requestCount)} 次`"
                placement="top"
                :append-to-body="true"
              >
                <div class="rate-cell">
                  <el-progress
                    :percentage="Math.min(100, Number(row.failureRate || 0))"
                    :stroke-width="6"
                    :show-text="false"
                    :color="failureRateColor(row.failureRate)"
                  />
                  <span class="rate-text">{{ formatRate(row.failureRate) }}</span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="连续失败" width="100" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-danger': Number(row.consecutiveFailures) > 0 }">{{ row.consecutiveFailures ?? 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="最近成功" width="170" align="center">
            <template #default="{ row }">{{ formatMonitorTime(row.lastSuccessTime) }}</template>
          </el-table-column>
          <el-table-column label="最近失败" width="170" align="center">
            <template #default="{ row }">
              <el-tooltip v-if="row.lastFailureReason" :content="row.lastFailureReason" placement="top" :append-to-body="true">
                <span class="table-ellipsis">{{ formatMonitorTime(row.lastFailureTime) }}</span>
              </el-tooltip>
              <span v-else>{{ formatMonitorTime(row.lastFailureTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="待处理" width="100" align="center">
            <template #default="{ row }">
              <el-tooltip
                v-if="Number(row.pendingTaskCount) > 0"
                :content="`最老待处理任务创建于 ${formatMonitorTime(row.oldestPendingTime)}${canViewDeliveryTask ? '，点击查看待处理任务' : ''}`"
                placement="top"
                :append-to-body="true"
              >
                <el-tag
                  size="small"
                  type="warning"
                  effect="light"
                  :class="{ 'is-clickable-tag': canViewDeliveryTask }"
                  @click="goDeliveryTasks(row, 'PENDING')"
                >
                  {{ row.pendingTaskCount }}
                </el-tag>
              </el-tooltip>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button v-if="canViewDeliveryTask" size="small" type="primary" link @click="goDeliveryTasks(row)">投递任务</el-button>
                <el-button
                  size="small"
                  type="primary"
                  link
                  @click="showCircuitDetail(row)"
                  v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:CIRCUIT_BREAKER_DETAIL']"
                >
                  熔断详情
                </el-button>
                <el-button
                  v-if="row.circuitState === 'OPEN'"
                  size="small"
                  type="warning"
                  link
                  @click="showOperate(row, 'PROBE')"
                  v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:CIRCUIT_BREAKER_PROBE']"
                >
                  提前探测
                </el-button>
                <el-button
                  v-if="row.circuitState === 'HALF_OPEN'"
                  size="small"
                  type="danger"
                  link
                  @click="showOperate(row, 'OPEN')"
                  v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:CIRCUIT_BREAKER_OPEN']"
                >
                  重新熔断
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="endpoint-pagination">
          <el-pagination
            v-model:current-page="state.endpointPagination.current"
            v-model:page-size="state.endpointPagination.size"
            :page-sizes="PAGE_SIZES"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.endpointPagination.total"
            @current-change="fetchEndpointPage"
            @size-change="handleEndpointSizeChange"
          />
        </div>
      </el-card>

      <BIamWebhookCircuitDetailDialog
        ref="detailDialogRef"
        v-model="state.dialog.detail"
        :endpoint-id="state.currentEndpointId"
        @operate="handleDetailOperate"
      />
      <BIamWebhookCircuitOperateDialog
        v-model="state.dialog.operate"
        :endpoint-id="state.currentEndpointId"
        :endpoint-name="state.currentEndpointName"
        :operate-type="state.operateType"
        @success="handleOperateSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  function formatMonitorNumber(value?: number | null): string {
    return Number(value || 0).toLocaleString()
  }

  function formatMonitorRate(value?: number | null): string {
    return `${Number(value || 0).toFixed(2)}%`
  }

  const formatNumber = formatMonitorNumber
  const formatRate = formatMonitorRate

  function failureRateColor(value?: number | null): string {
    const rate = Number(value || 0)
    if (rate >= 50) return '#f56c6c'
    if (rate >= 20) return '#e6a23c'
    return '#67c23a'
  }

  function circuitTooltip(row: BIamWebhookMonitorEndpointListResponseVo): string {
    if (row.circuitState === 'OPEN') {
      return `已持续打开 ${formatMonitorDuration(row.openDurationSeconds)}，预计 ${formatMonitorTime(row.nextProbeTime)} 可自动探测`
    }
    if (row.circuitState === 'HALF_OPEN') return '半开探测中，探测成功后恢复正常投递'
    return '正常投递'
  }

  function resolveMonitorTimeRange(presetMillis: number, customRange: number[]): { startTime: number; endTime: number } {
    if (presetMillis > 0) {
      const endTime = Date.now()
      return { startTime: endTime - presetMillis, endTime }
    }
    const [startTime, endTime] = customRange
    if (startTime != null && endTime != null) return { startTime: Number(startTime), endTime: Number(endTime) }
    const now = Date.now()
    return { startTime: now - 30 * 60 * 1000, endTime: now }
  }

  interface EndpointFilter {
    webhookEndpointCode?: string
    endpointStatus?: string | null
    pauseFlag?: boolean | null
    circuitState?: string | null
    hasPendingTask?: boolean | null
  }

  function buildMonitorEndpointQuery(filter: EndpointFilter, pagination: { current: number; size: number }): BIamWebhookMonitorEndpointPageQueryRequestVo {
    return {
      current: pagination.current,
      size: pagination.size,
      ...(filter.webhookEndpointCode && { webhookEndpointCode: filter.webhookEndpointCode.trim() }),
      ...(filter.endpointStatus && { endpointStatus: filter.endpointStatus }),
      ...(filter.pauseFlag != null && { pauseFlag: filter.pauseFlag }),
      ...(filter.circuitState && { circuitState: filter.circuitState }),
      ...(filter.hasPendingTask != null && { hasPendingTask: filter.hasPendingTask })
    }
  }
  defineOptions({
    name: 'BIamWebhookMonitor'
  })

  import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Histogram, Link, QuestionFilled, Refresh, Search, Timer, TrendCharts, Warning } from '@element-plus/icons-vue'
  import { BIamWebhookMonitorApi } from './api/BIamWebhookMonitor.api'
  import BIamWebhookMonitorTrendChart from './BIamWebhookMonitorTrendChart.vue'
  import BIamWebhookCircuitDetailDialog from './BIamWebhookCircuitDetailDialog.vue'
  import BIamWebhookCircuitOperateDialog from './BIamWebhookCircuitOperateDialog.vue'
  import { BIamWebhookEndpointApi } from '@/modules/biam/webhook/endpoint/api/BIamWebhookEndpoint.api'
  import { BIamWebhookEventApi } from '@/modules/biam/webhook/event/api/BIamWebhookEvent.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, DICT_IAM_WEBHOOK_MONITOR_INTERVAL, DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import {
    formatMonitorDuration,
    formatMonitorTime,
    WEBHOOK_CIRCUIT_STATE_TAG_TYPE,
    WEBHOOK_MONITOR_DEFAULT_PRESET,
    WEBHOOK_MONITOR_TIME_PRESETS,
    WEBHOOK_TREND_SERIES
  } from './type/BIamWebhookMonitor.type'
  import type {
    BIamWebhookCircuitOperateType,
    BIamWebhookMonitorEndpointListResponseVo,
    BIamWebhookMonitorEndpointPageQueryRequestVo,
    BIamWebhookMonitorOverviewResponseVo,
    BIamWebhookMonitorTrendPoint,
    BIamWebhookTrendMetricKey
  } from './type/BIamWebhookMonitor.type'

  interface EndpointSelectOption {
    id: string
    name: string
  }

  interface EventSelectOption {
    code: string
    name: string
  }

  const PAGE_SIZES = [20, 50, 100, 200]
  const OPTION_PAGE_SIZE = 200

  /** 投递状态筛选项：pauseFlag=true 表示人工暂停投递 */
  const PAUSE_FILTER_OPTIONS = [
    { label: '正常', value: false },
    { label: '暂停', value: true }
  ]

  /** 待处理任务筛选项 */
  const PENDING_FILTER_OPTIONS = [
    { label: '有待处理', value: true },
    { label: '无待处理', value: false }
  ]

  const enumStore = useDictionaryEnumStore()
  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_STATUS)
  const { options: circuitStateOptions, load: loadCircuitStateOptions } = useEnumOptions(DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE)
  const { options: trendIntervalOptions, load: loadTrendIntervalOptions } = useEnumOptions(DICT_IAM_WEBHOOK_MONITOR_INTERVAL)

  const canViewOverview = hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:WEBHOOK_OVERVIEW')
  const canViewTrend = hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:WEBHOOK_TREND')
  const canViewEndpointMonitor = hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:ENDPOINT_PAGE_EXPAND')
  const canViewDeliveryTask = hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:DELIVERY_TASK:PAGE_EXPAND')
  /** 无概览/趋势权限时隐藏统计筛选，仅保留刷新与接收端健康度 */
  const canViewStatistics = canViewOverview || canViewTrend

  const route = useRoute()
  const router = useRouter()

  const detailDialogRef = ref<InstanceType<typeof BIamWebhookCircuitDetailDialog>>()

  const state = reactive({
    presetMillis: WEBHOOK_MONITOR_DEFAULT_PRESET,
    customRange: [] as number[],
    filter: {
      webhookEndpointId: null as string | null,
      eventCode: null as string | null
    },
    autoRefreshSeconds: 0,
    overviewLoading: false,
    trendLoading: false,
    endpointLoading: false,
    refreshing: false,
    overview: {} as Partial<BIamWebhookMonitorOverviewResponseVo>,
    trendInterval: '',
    trendIntervalResult: '',
    trendPoints: [] as BIamWebhookMonitorTrendPoint[],
    visibleSeriesKeys: WEBHOOK_TREND_SERIES.map(item => item.key) as string[],
    endpointFilter: {
      webhookEndpointCode: '',
      endpointStatus: null as string | null,
      pauseFlag: null as boolean | null,
      circuitState: null as string | null,
      hasPendingTask: null as boolean | null
    },
    endpointTableData: [] as BIamWebhookMonitorEndpointListResponseVo[],
    endpointPagination: { current: 1, size: 20, total: 0 },
    currentEndpointId: '',
    currentEndpointName: '',
    operateType: 'PROBE' as BIamWebhookCircuitOperateType,
    dialog: {
      detail: false,
      operate: false
    }
  })

  const endpointOptions = ref<EndpointSelectOption[]>([])
  const endpointCardRef = ref<{ $el?: unknown }>()
  const eventOptions = ref<EventSelectOption[]>([])
  const lastRefreshTime = ref<number | null>(null)

  let autoRefreshTimer: ReturnType<typeof setInterval> | null = null
  let isFirstActivation = true

  const overview = computed(() => state.overview)

  const finishedTaskCount = computed(
    () =>
      Number(overview.value.successTaskCount || 0) +
      Number(overview.value.failedTaskCount || 0) +
      Number(overview.value.expiredTaskCount || 0) +
      Number(overview.value.cancelledTaskCount || 0)
  )

  const successRatePercent = computed(() => Math.min(100, Math.max(0, Number(overview.value.successRate || 0))))

  const successRateText = computed(() => `${Number(overview.value.successRate || 0).toFixed(2)}%`)

  const successRateColor = computed(() => {
    const value = successRatePercent.value
    if (value >= 99) return '#67c23a'
    if (value >= 95) return '#e6a23c'
    return '#f56c6c'
  })

  const circuitBrokenCount = computed(() => Number(overview.value.openCircuitCount || 0) + Number(overview.value.halfOpenCircuitCount || 0))

  const effectiveIntervalLabel = computed(() => enumStore.getEnumLabel(DICT_IAM_WEBHOOK_MONITOR_INTERVAL, state.trendIntervalResult, '自动'))

  const lastRefreshText = computed(() => (lastRefreshTime.value ? `最后更新 ${new Date(lastRefreshTime.value).toLocaleTimeString()}` : ''))

  const buildStatisticsParams = (range: { startTime: number; endTime: number }) => {
    return {
      ...range,
      ...(state.filter.webhookEndpointId && { webhookEndpointId: state.filter.webhookEndpointId }),
      ...(state.filter.eventCode && { eventCode: state.filter.eventCode })
    }
  }

  const fetchOverview = async (range: { startTime: number; endTime: number }) => {
    if (!canViewOverview) return
    try {
      state.overviewLoading = true
      state.overview = (await BIamWebhookMonitorApi.overview(buildStatisticsParams(range))) || {}
    } catch (error) {
      console.error('获取 Webhook 运行概览失败', error)
    } finally {
      state.overviewLoading = false
    }
  }

  const fetchTrend = async (range: { startTime: number; endTime: number }) => {
    if (!canViewTrend) return
    try {
      state.trendLoading = true
      const res = await BIamWebhookMonitorApi.trend({
        ...buildStatisticsParams(range),
        ...(state.trendInterval && { interval: state.trendInterval })
      })
      state.trendPoints = res?.points || []
      state.trendIntervalResult = res?.interval || ''
    } catch (error) {
      console.error('获取 Webhook 投递趋势失败', error)
    } finally {
      state.trendLoading = false
    }
  }

  const fetchStatistics = async () => {
    // 概览与趋势共用同一区间，避免两次取值时间不同导致口径不一致
    const range = resolveMonitorTimeRange(state.presetMillis, state.customRange)
    state.customRange = [range.startTime, range.endTime]
    await Promise.all([fetchOverview(range), fetchTrend(range)])
    lastRefreshTime.value = Date.now()
  }

  const buildEndpointQueryParams = () => buildMonitorEndpointQuery(state.endpointFilter, state.endpointPagination)

  const fetchEndpointPage = async () => {
    if (!canViewEndpointMonitor) return
    try {
      state.endpointLoading = true
      const res = await BIamWebhookMonitorApi.endpointPageExpand(buildEndpointQueryParams())
      state.endpointTableData = res?.records || []
      state.endpointPagination.total = res?.total || 0
    } catch (error) {
      console.error('获取接收端监控列表失败', error)
    } finally {
      state.endpointLoading = false
    }
  }

  const refreshAll = async () => {
    try {
      state.refreshing = true
      await Promise.all([fetchStatistics(), fetchEndpointPage()])
    } finally {
      state.refreshing = false
    }
  }

  const handlePresetChange = () => {
    fetchStatistics()
  }

  const handleCustomRangeChange = () => {
    // 手动选择区间后取消快捷区间，查询时使用自定义区间
    state.presetMillis = 0
    fetchStatistics()
  }

  const handleFilterChange = () => {
    fetchStatistics()
  }

  const handleTrendIntervalChange = () => {
    fetchTrend(resolveMonitorTimeRange(state.presetMillis, state.customRange))
  }

  const resetFilter = () => {
    state.presetMillis = WEBHOOK_MONITOR_DEFAULT_PRESET
    state.filter.webhookEndpointId = null
    state.filter.eventCode = null
    state.trendInterval = ''
    fetchStatistics()
  }

  const toggleSeries = (key: BIamWebhookTrendMetricKey) => {
    const keys = state.visibleSeriesKeys
    state.visibleSeriesKeys = keys.includes(key) ? keys.filter(item => item !== key) : [...keys, key]
  }

  const handleEndpointSearch = () => {
    state.endpointPagination.current = 1
    fetchEndpointPage()
  }

  const handleEndpointSizeChange = (size: number) => {
    state.endpointPagination.size = size
    state.endpointPagination.current = 1
    fetchEndpointPage()
  }

  const resetEndpointFilter = () => {
    state.endpointFilter.webhookEndpointCode = ''
    state.endpointFilter.endpointStatus = null
    state.endpointFilter.pauseFlag = null
    state.endpointFilter.circuitState = null
    state.endpointFilter.hasPendingTask = null
    handleEndpointSearch()
  }

  const drillDownEndpoints = (filter: Partial<typeof state.endpointFilter>) => {
    if (!canViewEndpointMonitor) return
    Object.assign(state.endpointFilter, filter)
    handleEndpointSearch()
    const cardEl = endpointCardRef.value?.$el
    if (cardEl instanceof HTMLElement) cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** 兜底接收端选项：来源页面可能带上未出现在前 N 条下拉数据中的接收端 */
  const ensureEndpointOption = (id: string, name?: string) => {
    if (endpointOptions.value.some(item => item.id === id)) return
    endpointOptions.value = [{ id, name: name || id }, ...endpointOptions.value]
  }

  /** 支持从接收端页带接收端跳转：webhookEndpointId / endpointName 过滤概览与趋势，endpointCode 过滤健康度表 */
  const applyRouteQuery = () => {
    const { webhookEndpointId, endpointName, endpointCode } = route.query
    if (typeof webhookEndpointId === 'string' && webhookEndpointId) {
      state.filter.webhookEndpointId = webhookEndpointId
      ensureEndpointOption(webhookEndpointId, typeof endpointName === 'string' ? endpointName : undefined)
    }
    if (typeof endpointCode === 'string' && endpointCode) {
      state.endpointFilter.webhookEndpointCode = endpointCode
    }
  }

  /** 下钻投递明细：复用投递任务页的筛选能力，按接收端（可再叠加状态）打开 */
  const goDeliveryTasks = (row: BIamWebhookMonitorEndpointListResponseVo, status?: string) => {
    if (!canViewDeliveryTask) return
    router.push({
      path: '/admin/system/webhook/task',
      query: {
        webhookEndpointId: row.webhookEndpointId,
        endpointName: row.webhookEndpointName || row.webhookEndpointCode,
        ...(status && { status })
      }
    })
  }

  const showCircuitDetail = (row: BIamWebhookMonitorEndpointListResponseVo) => {
    state.currentEndpointId = row.webhookEndpointId
    state.currentEndpointName = row.webhookEndpointName || row.webhookEndpointCode
    state.dialog.detail = true
  }

  const showOperate = (row: BIamWebhookMonitorEndpointListResponseVo, type: BIamWebhookCircuitOperateType) => {
    state.currentEndpointId = row.webhookEndpointId
    state.currentEndpointName = row.webhookEndpointName || row.webhookEndpointCode
    state.operateType = type
    state.dialog.operate = true
  }

  const handleDetailOperate = (type: BIamWebhookCircuitOperateType) => {
    state.operateType = type
    state.dialog.operate = true
  }

  const handleOperateSuccess = async () => {
    detailDialogRef.value?.refresh()
    await Promise.all([fetchStatistics(), fetchEndpointPage()])
  }

  const stopAutoRefresh = () => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  }

  const startAutoRefresh = () => {
    stopAutoRefresh()
    if (state.autoRefreshSeconds <= 0) return
    autoRefreshTimer = setInterval(() => {
      refreshAll()
    }, state.autoRefreshSeconds * 1000)
  }

  const handleAutoRefreshChange = () => {
    startAutoRefresh()
  }

  /** 接收端下拉（缺少接收端查询权限时跳过请求） */
  const loadEndpointOptions = async () => {
    if (!hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:PAGE_EXPAND')) return
    try {
      const res = await BIamWebhookEndpointApi.pageExpand({ current: 1, size: OPTION_PAGE_SIZE })
      endpointOptions.value = (res?.records || []).map(record => ({
        id: record.id,
        name: record.name || record.code
      }))
    } catch (error) {
      console.error('加载接收端选项失败', error)
    }
  }

  /** 事件编码下拉（缺少事件查询权限时跳过请求，仍可直接输入编码） */
  const loadEventOptions = async () => {
    if (!hasPermission('MANAGE_APP:SYSTEM:WEBHOOK:EVENT:PAGE_EXPAND')) return
    try {
      const res = await BIamWebhookEventApi.pageExpand({ current: 1, size: OPTION_PAGE_SIZE })
      eventOptions.value = (res?.records || []).map(record => ({
        code: record.code,
        name: record.name || record.code
      }))
    } catch (error) {
      console.error('加载事件选项失败', error)
    }
  }

  onMounted(async () => {
    await Promise.all([loadStatusOptions(), loadCircuitStateOptions(), loadTrendIntervalOptions(), loadEndpointOptions(), loadEventOptions()])
    applyRouteQuery()
    await refreshAll()
    startAutoRefresh()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    startAutoRefresh()
    await refreshAll()
  })

  onDeactivated(() => {
    stopAutoRefresh()
  })

  onBeforeUnmount(() => {
    stopAutoRefresh()
  })
</script>

<style scoped lang="scss">
  .webhook-monitor-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .webhook-monitor-main-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-card-filter {
    flex-shrink: 0;
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 16px;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .filter-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .preset-group {
      flex-wrap: wrap;
    }

    // el-date-picker 根元素不会继承 scoped 属性，且 el-input__wrapper 自带 flex-grow: 1，
    // 必须用 :deep() 并显式禁止伸缩，否则会撑满整行
    :deep(.time-picker) {
      flex: 0 0 auto;
      width: 300px;
      max-width: 100%;

      // 默认双时间输入各占 39% 宽、字号 14px，收窄后会被截断，这里一并压缩
      .el-range-input {
        width: 45%;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      .el-range-separator {
        flex: 0 0 auto;
        padding: 0 2px;
        font-size: 12px;
      }
    }

    .filter-item {
      width: 240px;
      max-width: 100%;
    }

    .filter-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-left: auto;
    }

    .auto-refresh-select {
      width: 160px;
    }

    .refresh-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-variant-numeric: tabular-nums;
    }
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 8px;
  }

  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-left: 3px solid var(--el-color-primary);
    border-radius: 8px;

    &.kpi-card--primary {
      border-left-color: var(--el-color-primary);
    }

    &.kpi-card--success {
      border-left-color: var(--el-color-success);
    }

    &.kpi-card--warning {
      border-left-color: var(--el-color-warning);
    }

    &.kpi-card--danger {
      border-left-color: var(--el-color-danger);
    }

    &.kpi-card--info {
      border-left-color: var(--el-color-info);
    }

    &.is-clickable {
      cursor: pointer;
      transition:
        box-shadow 0.2s ease,
        transform 0.2s ease;

      &:hover {
        box-shadow: 0 4px 14px rgb(0 0 0 / 10%);
        transform: translateY(-1px);
      }
    }
  }

  .kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .kpi-label {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .kpi-help {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    cursor: help;
  }

  .kpi-icon {
    font-size: 16px;
    color: var(--el-text-color-placeholder);
  }

  .kpi-body {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .kpi-ring {
    flex-shrink: 0;
  }

  .kpi-value-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .kpi-value-row {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }

  .kpi-value {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    font-variant-numeric: tabular-nums;
  }

  .kpi-unit {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .kpi-sub-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .kpi-sub {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &.is-muted {
      color: var(--el-text-color-placeholder);
    }
  }

  .kpi-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .kpi-tag {
    padding: 1px 8px;
    font-size: 12px;
    line-height: 18px;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-radius: 10px;

    &.is-success {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.is-danger {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }

    &.is-warning {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
  }

  .box-card-trend,
  .box-card-endpoint {
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);

    :deep(.el-card__body) {
      padding: 12px 16px;
    }
  }

  /* 接收端健康度卡片固定高度，数据超出时表格区域内滚动 */
  .box-card-endpoint {
    height: 620px;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    .card-header,
    .endpoint-pagination {
      flex-shrink: 0;
    }
  }

  .card-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    &.card-header--wrap {
      flex-wrap: wrap;
    }
  }

  .card-title {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .card-title-tip {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
  }

  .legend-item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    &.is-hidden {
      color: var(--el-text-color-placeholder);
      opacity: 0.6;

      .legend-dot {
        background: var(--el-border-color) !important;
      }
    }
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .legend-interval {
    margin-left: auto;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .chart-skeleton {
    height: 300px;
    padding: 8px 0;
  }

  .endpoint-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .endpoint-filter-item {
    width: 140px;

    &.endpoint-filter-item--input {
      width: 180px;
    }
  }

  .endpoint-table {
    flex: 1;
    width: 100%;
    min-height: 0;

    .header-with-help {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      cursor: help;
    }

    .header-help-icon {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    .is-clickable-tag {
      cursor: pointer;
    }

    .endpoint-cell {
      display: flex;
      flex-direction: column;
      min-width: 0;

      .endpoint-name {
        overflow: hidden;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .endpoint-code {
        overflow: hidden;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .rate-cell {
      display: flex;
      gap: 8px;
      align-items: center;

      :deep(.el-progress) {
        flex: 1;
        min-width: 50px;
      }

      .rate-text {
        width: 52px;
        font-size: 12px;
        color: var(--el-text-color-regular);
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
    }

    .text-danger {
      font-weight: 600;
      color: var(--el-color-danger);
    }

    .table-ellipsis {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }

  .table-actions {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;

    :deep(.el-button) {
      margin-left: 0;
    }
  }

  .endpoint-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
</style>
