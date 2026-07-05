import type { PageRequest, PageResponse } from '@/common/types/Common.type'

export interface DataBrandCreateRequestVo {
  name: string
  logoMaterialId: string
  description?: string
}

export interface DataBrandUpdateRequestVo {
  id: string
  name: string
  logoMaterialId: string
  description?: string
}

export interface DataBrandUpdateStatusRequestVo {
  id: string
  status: string
}

export interface DataBrandDetailResponseVo {
  id: string
  code?: string
  name: string
  status: string
  logoMaterialId: string
  logoUrl: string
  description?: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 角色分页查询接口请求参数
export interface DataBrandQueryPageRequestVo extends PageRequest {
  code?: string
  name?: string
  status?: string
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 角色分页查询接口返回参数
export interface DataBrandSimpleListResponseVo {
  id: string
  code?: string
  name: string
  status: string
}

export interface DataBrandExpandListResponseVo {
  id: string
  code?: string
  name: string
  status: StatusEnum
  logoMaterialId: string
  logoUrl: string
  description?: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type DataBrandSimplePageResponse = PageResponse<DataBrandSimpleListResponseVo>
export type DataBrandExpandPageResponse = PageResponse<DataBrandExpandListResponseVo>
