import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamUserCreateRequestVo,
  BIamUserUpdateRequestVo,
  BIamUserUpdateStatusRequestVo,
  BIamUserUpdatePhoneRequestVo,
  BIamUserUpdatePasswordRequestVo,
  BIamUserQueryPageRequestVo,
  BIamUserExportRequestVo,
  BIamUserDetailResponseVo,
  BIamUserSimplePageResponse,
  BIamUserExpandPageResponse,
  BIamUserUpdatePermissionRequestVo
} from '../type/BIamUser.type'

// 创建
const create = async (params: BIamUserCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/biam/user/create', params)
}

// 修改
const update = async (params: BIamUserUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/user/update', params)
}

// 修改用户状态
const updateStatus = async (params: BIamUserUpdateStatusRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/user/update_status', params)
}

// 修改用户手机号
const updatePhone = async (params: BIamUserUpdatePhoneRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/user/update_phone', params)
}

// 修改用户密码
const updatePassword = async (params: BIamUserUpdatePasswordRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/user/update_password', params)
}

// 修改用户权限
const updatePermission = async (params: BIamUserUpdatePermissionRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/user/update_permission', params)
}

// 详情
const detail = async (params: IdRequest): Promise<BIamUserDetailResponseVo> => {
  return request.post<BIamUserDetailResponseVo>(IAM_API_BASE_URL + 'iam/biam/user/detail', params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: BIamUserQueryPageRequestVo): Promise<BIamUserSimplePageResponse> => {
  return request.post<BIamUserSimplePageResponse>(IAM_API_BASE_URL + 'iam/biam/user/page_simple', params)
}

// 分页查询(应用于管理菜单)
const pageExpand = async (params: BIamUserQueryPageRequestVo): Promise<BIamUserExpandPageResponse> => {
  return request.post<BIamUserExpandPageResponse>(IAM_API_BASE_URL + 'iam/biam/user/page_expand', params)
}

// 导出（按条件或按选中 userIdSet，任务创建后到下载中心查看）
const exportUser = async (params: BIamUserExportRequestVo): Promise<void> => {
  return request.post<void>(IAM_API_BASE_URL + 'iam/biam/user/export', params)
}

export const BIamUserApi = {
  create,
  update,
  updateStatus,
  updatePhone,
  updatePassword,
  updatePermission,
  detail,
  pageSimple,
  pageExpand,
  exportUser
}
