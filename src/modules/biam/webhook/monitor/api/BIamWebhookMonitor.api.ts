import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type {
  BIamWebhookCircuitBreakerDetailResponseVo,
  BIamWebhookCircuitBreakerOperateRequestVo,
  BIamWebhookMonitorEndpointPageQueryRequestVo,
  BIamWebhookMonitorEndpointPageResponse,
  BIamWebhookMonitorOverviewQueryRequestVo,
  BIamWebhookMonitorOverviewResponseVo,
  BIamWebhookMonitorTrendQueryRequestVo,
  BIamWebhookMonitorTrendResponseVo
} from '../type/BIamWebhookMonitor.type'

// Webhook运行概览
const overview = async (params: BIamWebhookMonitorOverviewQueryRequestVo): Promise<BIamWebhookMonitorOverviewResponseVo> => {
  return request.post<BIamWebhookMonitorOverviewResponseVo>(iamApi('iam/biam/webhook/monitor/webhook_overview'), params)
}

// Webhook投递趋势（任务数按任务时间统计，HTTP 次数按执行记录统计）
const trend = async (params: BIamWebhookMonitorTrendQueryRequestVo): Promise<BIamWebhookMonitorTrendResponseVo> => {
  return request.post<BIamWebhookMonitorTrendResponseVo>(iamApi('iam/biam/webhook/monitor/webhook_trend'), params)
}

// 分页查询Webhook接收端运行信息
const endpointPageExpand = async (params: BIamWebhookMonitorEndpointPageQueryRequestVo): Promise<BIamWebhookMonitorEndpointPageResponse> => {
  return request.post<BIamWebhookMonitorEndpointPageResponse>(iamApi('iam/biam/webhook/monitor/endpoint_page_expand'), params)
}

// 接收端熔断详情
const circuitBreakerDetail = async (params: IdRequest): Promise<BIamWebhookCircuitBreakerDetailResponseVo> => {
  return request.post<BIamWebhookCircuitBreakerDetailResponseVo>(iamApi('iam/biam/webhook/monitor/circuit_breaker_detail'), params)
}

// 熔断提前探测（OPEN → HALF_OPEN）
const circuitBreakerProbe = async (params: BIamWebhookCircuitBreakerOperateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/monitor/circuit_breaker_probe'), params)
}

// 熔断人工重新熔断（HALF_OPEN → OPEN）
const circuitBreakerOpen = async (params: BIamWebhookCircuitBreakerOperateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/monitor/circuit_breaker_open'), params)
}

export const BIamWebhookMonitorApi = {
  overview,
  trend,
  endpointPageExpand,
  circuitBreakerDetail,
  circuitBreakerProbe,
  circuitBreakerOpen
}
