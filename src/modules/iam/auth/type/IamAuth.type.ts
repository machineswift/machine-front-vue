// 验证码接口返回数据
export interface IamAuthCaptchaResponseVo {
  userKey: string
  captchaImg: string // base64编码的图片
}

// 用户名密码登录接口请求数据
export interface IamAuthUsernameLoginRequestVo {
  username: string
  password: string
  captcha: string
  userKey: string
}

// 登录接口返回数据
export interface IamAuthLoginResponseVo {
  accessToken: string
  expiresIn: number
  refreshToken: string
  tokenType: string
}
