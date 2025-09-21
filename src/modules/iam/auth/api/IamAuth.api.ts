import request from '@/modules/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IamAuthCaptchaResponseVo, IamAuthUsernameLoginRequestVo, IamAuthLoginResponseVo } from '@/modules/iam/auth/type/IamAuth.type'

// 获取图形验证码
const getPictureCaptcha = async (): Promise<IamAuthCaptchaResponseVo> => {
  return request.get<IamAuthCaptchaResponseVo>(IAM_API_BASE_URL + 'iam/auth/picture_captcha', null, {
    skipAuth: true
  })
}

// 用户名密码登录
const loginByUsername = async (params: IamAuthUsernameLoginRequestVo): Promise<IamAuthLoginResponseVo> => {
  return request.post<IamAuthLoginResponseVo>(IAM_API_BASE_URL + 'iam/auth/login/username', params, {
    skipAuth: true
  })
}

// 获取 accessToken
const getAccessToken = async (refreshToken: string): Promise<IamAuthLoginResponseVo> => {
  return request.get<IamAuthLoginResponseVo>(IAM_API_BASE_URL + 'iam/auth/access_token', null, {
    headers: {
      Authorization: `Bearer ${refreshToken}`
    },
    skipAuth: true
  })
}

// 登出
const logout = async (): Promise<void> => {
  return request.get(IAM_API_BASE_URL + 'iam/auth/logout')
}

export const IamAuthApi = {
  getPictureCaptcha,
  loginByUsername,
  getAccessToken,
  logout
}
