// 属性类型枚举
export type ScmProperityTypeEnum = 'KEY' | 'SALE' | 'SPEC'

// 输入方式枚举
export type ScmItemInputTypeEnum = 'SELECT' | 'INPUT'

// 属性值列表响应
export interface ScmPropertyValueListResponseVo {
  id: string
  propertyId: string
  value: string
  sort: number
}

// 创建属性请求
export interface ScmPropertyCreateRequestVo {
  code: string
  name: string
  propertyType: ScmProperityTypeEnum
  isRequired: boolean
  inputType: ScmItemInputTypeEnum
  isMultiple: boolean
  isSearch: boolean
  features?: string
}

// 修改属性请求
export interface ScmPropertyUpdateRequestVo {
  id: string
  name: string
  isRequired: boolean
  inputType: ScmItemInputTypeEnum
  isMultiple: boolean
  isSearch: boolean
  features?: string
}

// 分页查询属性请求
export interface ScmPropertyQueryPageRequestVo {
  current?: number
  size?: number
  code?: string
  name?: string
  propertyType?: ScmProperityTypeEnum
  inputType?: ScmItemInputTypeEnum
  isSearch?: boolean
}

// 属性详情响应
export interface ScmPropertyDetailResponseVo {
  id: string
  code: string
  name: string
  propertyType: ScmProperityTypeEnum
  isRequired: boolean
  inputType: ScmItemInputTypeEnum
  isMultiple: boolean
  isSearch: boolean
  features: string
  valueList: ScmPropertyValueListResponseVo[]
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 属性列表响应（精简版，应用于组件弹窗/属性选择器）
export interface ScmPropertySimpleListResponseVo {
  id: string
  code: string
  name: string
  propertyType: ScmProperityTypeEnum
  inputType: ScmItemInputTypeEnum
}

// 属性列表响应（完整版，应用于属性库管理菜单）
export interface ScmPropertyListResponseVo {
  id: string
  code: string
  name: string
  propertyType: ScmProperityTypeEnum
  isRequired: boolean
  inputType: ScmItemInputTypeEnum
  isMultiple: boolean
  isSearch: boolean
  features: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}
