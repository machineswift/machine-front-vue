import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type {
  BIamAuthCaptchaResponseVo,
  BIamAuthUsernameLoginRequestVo,
  BIamAuthLoginResponseVo,
  BIamAuthAccessTokenRequestVo
} from '@/modules/biam/authentication/type/BIamAuthenticationCaptcha.type'

// 获取图形验证码
const getPictureCaptcha = async (): Promise<BIamAuthCaptchaResponseVo> => {
  return request.get<BIamAuthCaptchaResponseVo>(iamApi('iam/biam/authentication/internal/picture_captcha'), undefined, {
    skipAuth: true
  })
}

// 用户名密码登录
const loginByUsername = async (params: BIamAuthUsernameLoginRequestVo): Promise<BIamAuthLoginResponseVo> => {
  return request.post<BIamAuthLoginResponseVo>(iamApi('iam/biam/authentication/internal/login/username'), params, {
    skipAuth: true
  })
}

// 获取 accessToken
const getAccessToken = async (params: BIamAuthAccessTokenRequestVo): Promise<BIamAuthLoginResponseVo> => {
  return request.post<BIamAuthLoginResponseVo>(iamApi('iam/biam/authentication/internal/access_token'), params, {
    skipAuth: true
  })
}

// 登出
const logout = async (): Promise<void> => {
  return request.get(iamApi('iam/biam/authentication/internal/logout'))
}

export const BIamAuthenticationCaptchaApi = {
  getPictureCaptcha,
  loginByUsername,
  getAccessToken,
  logout
}
