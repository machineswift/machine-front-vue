import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import {
  type IamAuthChangePasswordRequestVo,
  type IamAuthCurrentUserResponseVo,
  type IamAuthCurrentUserFunctionPermissionResponseVo
} from '../type/IamCurrent.type'

// 修改密码
const changePassword = async (params: IamAuthChangePasswordRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/current/change_password', params)
}

// 获取当前用户信息
const getCurrentUser = async (): Promise<IamAuthCurrentUserResponseVo> => {
  return request.get<IamAuthCurrentUserResponseVo>(IAM_API_BASE_URL + 'iam/current/user_info')
}

// 获取当前用户功能权限信息
const getFunctionPermission = async (): Promise<IamAuthCurrentUserFunctionPermissionResponseVo> => {
  return request.get<IamAuthCurrentUserFunctionPermissionResponseVo>(IAM_API_BASE_URL + 'iam/current/function_permission')
}

export const IamCurrentApi = {
  changePassword,
  getCurrentUser,
  getFunctionPermission
}
