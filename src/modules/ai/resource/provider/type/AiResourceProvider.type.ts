// 创建厂商请求
export interface AiResourceProviderCreateRequestVo {
  provider: string
  baseUrl: string
  apiKey: string
  description?: string
}

// 修改厂商请求
export interface AiResourceProviderUpdateRequestVo {
  id: string
  baseUrl?: string
  apiKey?: string
  description?: string
}

// 修改厂商状态请求
export interface AiResourceProviderUpdateStatusRequestVo {
  id: string
  status: string
}

// 厂商列表请求
export interface AiResourceProviderListRequestVo {
  status?: string
}

// 厂商详情响应
export interface AiResourceProviderDetailResponseVo {
  id: string
  status: string
  provider: string
  baseUrl: string
  apiKey: string
  description?: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

// 厂商列表响应（简单）
export interface AiResourceProviderListResponseVo {
  id: string
  status: string
  provider: string
  baseUrl: string
  description?: string
  createBy?: string
  createTime: number
  updateBy?: string
  updateTime: number
}

// 厂商列表响应（扩展，包含用户姓名）
export interface AiResourceProviderExpandListResponseVo extends AiResourceProviderListResponseVo {
  createName?: string
  updateName?: string
}
