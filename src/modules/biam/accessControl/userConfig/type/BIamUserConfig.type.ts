// 查询用户配置请求数据
export interface BIamUserConfigGetRequestVo {
  configKey: string
}

// 保存用户配置请求数据
export interface BIamUserConfigSaveRequestVo {
  configKey: string
  configValue: string
}

// 用户配置返回数据
export interface BIamUserConfigResponseVo {
  configKey: string
  configValue: string
}
