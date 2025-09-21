import request from '@/modules/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type {
  IamUserCreateRequestVo,
  IamUserUpdateRequestVo,
  IamUserUpdateStatusRequestVo,
  IamUserUpdatePhoneRequestVo,
  IamUserUpdatePasswordRequestVo,
  IamUserQueryPageRequestVo,
  IamUserDetailResponseVo,
  IamUserSimplePageResponse,
  IamUserExpandPageResponse,
  IamUserUpdatePermissionRequestVo
} from '../type/IamUser.type'

// 创建
const create = async (params: IamUserCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/user/create', params)
}

// 修改
const update = async (params: IamUserUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/user/update', params, params)
}

// 修改用户状态
const updateStatus = async (params: IamUserUpdateStatusRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/user/update_status', params)
}

// 修改用户手机号
const updatePhone = async (params: IamUserUpdatePhoneRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/user/update_phone', params)
}

// 修改用户密码
const updatePassword = async (params: IamUserUpdatePasswordRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/user/update_password', params)
}

// 修改用户权限
const updatePermission = async (params: IamUserUpdatePermissionRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/user/update_permission', params)
}

// 详情
const detail = async (params: IdRequest): Promise<IamUserDetailResponseVo> => {
  return request.post<IamUserDetailResponseVo>(IAM_API_BASE_URL + 'iam/user/detail', params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: IamUserQueryPageRequestVo): Promise<IamUserSimplePageResponse> => {
  return request.post<IamUserSimplePageResponse>(IAM_API_BASE_URL + 'iam/user/page_simple', params)
}

// 分页查询(应用于管理菜单)
const pageExpand = async (params: IamUserQueryPageRequestVo): Promise<IamUserExpandPageResponse> => {
  return request.post<IamUserExpandPageResponse>(IAM_API_BASE_URL + 'iam/user/page_expand', params)
}

export const IamUserApi = {
  create,
  update,
  updateStatus,
  updatePhone,
  updatePassword,
  updatePermission,
  detail,
  pageSimple,
  pageExpand
}
