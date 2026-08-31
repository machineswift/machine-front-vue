// 验证码接口返回数据
export interface BIamAuthCaptchaResponseVo {
  userKey: string
  captchaImg: string // base64编码的图片
}

// 用户名密码登录接口请求数据
export interface BIamAuthUsernameLoginRequestVo {
  username: string
  password: string
  captcha: string
  userKey: string
}

export interface BIamAuthAccessTokenRequestVo {
  refreshToken: string
}

// 登录接口返回数据
export interface BIamAuthLoginResponseVo {
  accessToken: string
  expiresIn: number
  refreshToken: string
  tokenType: string
  lastRefreshTime?: number
}
