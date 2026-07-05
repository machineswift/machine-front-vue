// 创建属性枚举值请求
export interface ScmPropertyValueCreateRequestVo {
  propertyId: string
  value: string
  sort: number
}

// 修改属性枚举值请求
export interface ScmPropertyValueUpdateRequestVo {
  id: string
  value: string
  sort: number
}

// 根据属性ID查询枚举值列表请求
export interface ScmPropertyValueListByPropertyRequestVo {
  propertyId: string
}

// 属性枚举值列表响应
export interface ScmPropertyValueListResponseVo {
  id: string
  propertyId: string
  value: string
  sort: number
}
