// 登录用户修改密码接口请求数据
export interface BIamAuthChangePasswordRequestVo {
  oldPassword: string
  newPassword: string
}

// 登录用户信息接口返回数据
export interface BIamAuthCurrentUserResponseVo {
  id: string
  username: string
  code: string
  name: string
  phone: string
}

// 登录用户权限接口返回数据
export interface BIamAuthCurrentUserFunctionPermissionResponseVo {
  roleCodeList: string[]
  permissionCodeList: string[]
}
