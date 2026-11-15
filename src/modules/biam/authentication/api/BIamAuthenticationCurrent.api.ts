import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import {
  type BIamAuthChangePasswordRequestVo,
  type BIamAuthCurrentUserResponseVo,
  type BIamAuthCurrentUserFunctionPermissionResponseVo
} from '../type/BIamAuthenticationCurrent.type'

// 修改密码
const changePassword = async (params: BIamAuthChangePasswordRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/authentication/internal/change_password'), params)
}

// 获取当前用户信息
const getCurrentUser = async (): Promise<BIamAuthCurrentUserResponseVo> => {
  return request.get<BIamAuthCurrentUserResponseVo>(iamApi('iam/biam/authentication/internal/user_info'))
}

// 获取当前用户功能权限信息
const getFunctionPermission = async (): Promise<BIamAuthCurrentUserFunctionPermissionResponseVo> => {
  return request.get<BIamAuthCurrentUserFunctionPermissionResponseVo>(iamApi('iam/biam/authentication/internal/function_permission'))
}

export const BIamAuthenticationCurrentApi = {
  changePassword,
  getCurrentUser,
  getFunctionPermission
}
