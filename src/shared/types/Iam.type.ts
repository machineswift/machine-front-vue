/**
 * IAM 在共享层使用的最小类型。
 *
 * 这些类型描述的是“共享层真正依赖的字段”，而不是后端 DTO 的完整镜像，
 * 目的是避免 shared 目录反向 import modules/biam 的 DTO。
 * 后端 DTO 在结构上满足这些接口，可直接赋值。
 */
export interface IamAuthInfo {
  accessToken: string
  expiresIn: number
  refreshToken: string
  tokenType: string
  lastRefreshTime?: number
}

export interface IamCurrentUser {
  id: string
  username: string
  code: string
  name: string
  phone: string
}

export interface IamFunctionPermission {
  roleCodeList: string[]
  permissionCodeList: string[]
}
