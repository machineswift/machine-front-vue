import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/**
 * 授权码模式可用的 OIDC 标准作用域（与后端 VO 注释 openid、profile、email、address、phone 一致）
 */
export const AUTH_CODE_SCOPE_OPTIONS = ['openid', 'profile', 'email', 'address', 'phone'] as const

/** 授权码模式默认勾选作用域（OIDC 强制要求 openid） */
export const AUTH_CODE_DEFAULT_SCOPES = ['openid'] as const

export interface BIamAuth2RegisteredClientCreateRequestVo {
  /** 授权方式：CLIENT_CREDENTIALS / AUTHORIZATION_CODE */
  authorizationGrantType: string
  clientName: string
  clientSecret: string
  /** 作用域：客户端凭证模式为角色ID，授权码模式为 OIDC 标准作用域 */
  scopes: string[]
  /** IP 白名单（留空表示不限制） */
  allowedIps: string[]
  /** 重定向URI（仅授权码模式必填） */
  redirectUris?: string[]
  /** 登出后重定向URI（仅授权码模式必填） */
  postLogoutRedirectUris?: string[]
}

export interface BIamAuth2RegisteredClientUpdateRequestVo {
  id: string
  clientName: string
  clientSecret?: string
  /** 作用域：客户端凭证模式为角色ID，授权码模式为 OIDC 标准作用域 */
  scopes: string[]
  /** IP 白名单（留空表示不限制） */
  allowedIps: string[]
  /** 重定向URI（仅授权码模式必填） */
  redirectUris?: string[]
  /** 登出后重定向URI（仅授权码模式必填） */
  postLogoutRedirectUris?: string[]
}

export interface BIamAuth2RegisteredClientUpdateStatusRequestVo {
  id: string
  status: string
}

export interface BIamAuth2RegisteredClientPageQueryRequestVo extends PageRequest {
  /** 授权方式筛选 */
  authorizationGrantType?: string
  clientId?: string
  clientName?: string
  status?: string
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  updateStartTime?: number
  updateEndTime?: number
  createStartTime?: number
  createEndTime?: number
}

export interface BIamAuth2RegisteredClientDetailResponseVo {
  id: string
  /** 授权方式：CLIENT_CREDENTIALS / AUTHORIZATION_CODE */
  authorizationGrantType: string
  status: string
  clientId: string
  clientName: string
  scopes: string[]
  /** IP 白名单（留空表示不限制） */
  allowedIps?: string[]
  /** 重定向URI（仅授权码模式返回） */
  redirectUris?: string[]
  /** 登出后重定向URI（仅授权码模式返回） */
  postLogoutRedirectUris?: string[]
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

export interface BIamAuth2RegisteredClientListResponseVo {
  id: string
  /** 授权方式：CLIENT_CREDENTIALS / AUTHORIZATION_CODE */
  authorizationGrantType: string
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

export type BIamAuth2RegisteredClientPageResponse = PageResponse<BIamAuth2RegisteredClientListResponseVo>
