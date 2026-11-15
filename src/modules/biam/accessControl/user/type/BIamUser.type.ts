import type { BusinessDto, PageRequest, PageResponse } from '@/shared/types/Common.type'

export interface BIamUserCreateRequestVo {
  username: string
  name: string
  phone: string
  gender: string
  description: string
}

export interface BIamUserUpdateRequestVo {
  id: string
  username: string
  name: string
  gender: string
  description: string
}

export interface BIamUserUpdateStatusRequestVo {
  id: string
  status: string
}

export interface BIamUserUpdatePhoneRequestVo {
  id: string
  phone: string
}

export interface BIamUserUpdatePasswordRequestVo {
  id: string
  newPassword: string
}

export interface BIamUserUpdatePermissionRequestVo {
  id: string
  organizationIdMap: Map<string, string[]>
  userRoleInfoList: BIamUserRoleUpdateRequestVo[]
}

export interface BIamUserRoleUpdateRequestVo {
  roleId: string
  shopIdSet: string[]
}

export interface BIamUserQueryPageRequestVo extends PageRequest {
  username?: string
  name?: string
  code?: string
  status?: string
  phone?: string
  gender?: string
  shopIdSet?: string[]
  departmentIdSet?: string[]
  organizationType?: string
  organizationIdSet?: string[]
  roleIdSet?: string[]
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

/** 用户导出请求（支持按条件导出或按 userIdSet 导出选中） */
export interface BIamUserExportRequestVo {
  userIdSet?: string[]
  username?: string
  name?: string
  code?: string
  status?: string
  phone?: string
  gender?: string
  shopIdSet?: string[]
  departmentIdSet?: string[]
  organizationType?: string
  organizationIdSet?: string[]
  roleIdSet?: string[]
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

export interface BIamUserRoleInfoResponse {
  id: string
  type: string
  name: string
  code: string
  status: string
  sort: number
  shopIdList: string[] //前端计算使用
  shopList: BusinessDto[]
  createTime: number
}

export interface BIamUserDetailResponseVo {
  id: string
  username: string
  name: string
  code: string
  status: string
  phone: string
  gender: string
  organizationIdMap: Map<string, string[]>
  userRoleInfoList: BIamUserRoleInfoResponse[]
  description: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export interface BIamUserSimpleListResponseVo {
  id: string
  username: string
  name: string
  code: string
  status: string
  phone: string
  gender: string
  createTime: number
  updateTime: number
}

export interface BIamUserExpandListResponseVo {
  id: string
  username: string
  name: string
  code: string
  status: string
  phone: string
  gender: string
  description: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type BIamUserSimplePageResponse = PageResponse<BIamUserSimpleListResponseVo>
export type BIamUserExpandPageResponse = PageResponse<BIamUserExpandListResponseVo>
