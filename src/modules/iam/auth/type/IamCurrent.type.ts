// 登录用户修改密码接口请求数据
export interface IamAuthChangePasswordRequestVo {
  oldPassword: string
  newPassword: string
}

// 登录用户信息接口返回数据
export interface IamAuthCurrentUserResponseVo {
  id: string
  username: string
  code: string
  name: string
  phone: string
}

// 登录用户权限接口返回数据
export interface IamAuthCurrentUserFunctionPermissionResponseVo {
  roleCodeList: string[]
  permissionCodeList: string[]
}
