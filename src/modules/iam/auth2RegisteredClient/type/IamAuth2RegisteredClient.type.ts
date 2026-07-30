import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

export interface IamAuth2RegisteredClientCreateRequestVo {
  clientName: string
  clientSecret: string
  scopes: string[]
}

export interface IamAuth2RegisteredClientUpdateRequestVo {
  id: string
  clientName: string
  clientSecret?: string
  scopes: string[]
}

export interface IamAuth2RegisteredClientUpdateStatusRequestVo {
  id: string
  status: string
}

export interface IamAuth2RegisteredClientPageQueryRequestVo extends PageRequest {
  clientId?: string
  clientName?: string
  status?: string
  updateStartTime?: number
  updateEndTime?: number
}

export interface IamAuth2RegisteredClientDetailResponseVo {
  id: string
  status: string
  clientId: string
  clientName: string
  scopes: string[]
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

export interface IamAuth2RegisteredClientListResponseVo {
  id: string
  status: string
  clientId: string
  clientName: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

export type IamAuth2RegisteredClientPageResponse = PageResponse<IamAuth2RegisteredClientListResponseVo>
