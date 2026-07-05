import type { BusinessDto, PageRequest, PageResponse } from '@/common/types/Common.type'

export interface IamUserCreateRequestVo {
  username: string
  name: string
  phone: string
  gender: string
  description: string
}

export interface IamUserUpdateRequestVo {
  id: string
  username: string
  name: string
  gender: string
  description: string
}

export interface IamUserUpdateStatusRequestVo {
  id: string
  status: string
}

export interface IamUserUpdatePhoneRequestVo {
  id: string
  phone: string
}

export interface IamUserUpdatePasswordRequestVo {
  id: string
  newPassword: string
}

export interface IamUserUpdatePermissionRequestVo {
  id: string
  organizationIdMap: Map<string, string[]>
  userRoleInfoList: IamUserRoleUpdateRequestVo[]
}

export interface IamUserRoleUpdateRequestVo {
  roleId: string
  shopIdSet: string[]
}

export interface IamUserQueryPageRequestVo extends PageRequest {
  username?: string
  name?: string
  code?: string
  status?: string
  phone?: string
  gender?: string
  shopIdSet?: string[]
  departmentIdSet?: string[]
  organizationType: string
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
export interface IamUserExportRequestVo {
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

export interface IamUserRoleInfoResponse {
  id: string
  type: string
  name: string
  code: string
  sort: number
  shopIdList: string[] //前端计算使用
  shopList: BusinessDto[]
}

export interface IamUserDetailResponseVo {
  id: string
  username: string
  name: string
  code: string
  status: string
  phone: string
  gender: string
  organizationIdMap: Map<string, string[]>
  userRoleInfoList: IamUserRoleInfoResponse[]
  description: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export interface IamUserSimpleListResponseVo {
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

export interface IamUserExpandListResponseVo {
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

export type IamUserSimplePageResponse = PageResponse<IamUserSimpleListResponseVo>
export type IamUserExpandPageResponse = PageResponse<IamUserExpandListResponseVo>
