import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

// 扩展特性-能力枚举
export type AiModelCapabilityEnum = 'CHAT' | 'VISION' | 'ASR' | 'IMAGE' | 'TTS' | 'VIDEO' | 'EMBEDDING'

// 扩展特性-特性枚举
export type AiModelFeatureEnum = 'DEEP_THINKING' | 'THINKING_MODE' | 'STREAMING' | 'TOOL_STREAMING' | 'TOOL_CALL' | 'CONTEXT_CACHE' | 'STRUCTURED_OUTPUT'

// Token限制
export interface TokenLimits {
  contextLength?: number
  outputLength?: number
}

// 模型扩展特性
export interface AiModelFeaturesDto {
  capabilityList?: AiModelCapabilityEnum[]
  featureList?: AiModelFeatureEnum[]
  temperature?: number
  tokenLimits?: TokenLimits
}

// 创建模型请求
export interface AiResourceModelCreateRequestVo {
  providerId: string
  name: string
  code: string
  features?: AiModelFeaturesDto
  description?: string
}

// 修改模型请求
export interface AiResourceModelUpdateRequestVo {
  id: string
  providerId?: string
  name?: string
  code?: string
  features?: AiModelFeaturesDto
  description?: string
}

// 修改模型状态请求
export interface AiResourceModelUpdateStatusRequestVo {
  id: string
  status: string
}

// 模型详情响应
export interface AiResourceModelDetailResponseVo {
  id: string
  status: string
  providerId: string
  name: string
  code: string
  features?: AiModelFeaturesDto
  description?: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

// 分页查询请求
export interface AiResourceModelQueryPageRequestVo extends PageRequest {
  status?: string
  providerId?: string
  code?: string
  name?: string
  description?: string
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 简单列表响应（用于组件弹窗）
export interface AiResourceModelSimpleListResponseVo {
  id: string
  status: string
  providerId: string
  name: string
  code: string
}

// 扩展列表响应（用于管理菜单）
export interface AiResourceModelExpandListResponseVo {
  id: string
  status: string
  providerId: string
  name: string
  code: string
  description?: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

export type AiResourceModelSimplePageResponse = PageResponse<AiResourceModelSimpleListResponseVo>
export type AiResourceModelExpandPageResponse = PageResponse<AiResourceModelExpandListResponseVo>
