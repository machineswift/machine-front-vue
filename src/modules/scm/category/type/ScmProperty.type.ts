// 属性类型/输入方式枚举由后端字典维护（ScmProperityTypeEnum / ScmItemInputTypeEnum），
// 前端不定义枚举，通过 useDictionaryEnumStore.getEnumDataAsync 动态加载选项，此处仅存 code 字符串

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
  propertyType: string
  isRequired: boolean
  inputType: string
  isMultiple: boolean
  isSearch: boolean
  features?: string
}

// 修改属性请求
export interface ScmPropertyUpdateRequestVo {
  id: string
  name: string
  isRequired: boolean
  inputType: string
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
  propertyType?: string
  inputType?: string
  isSearch?: boolean
}

// 属性详情响应
export interface ScmPropertyDetailResponseVo {
  id: string
  code: string
  name: string
  propertyType: string
  isRequired: boolean
  inputType: string
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
  propertyType: string
  inputType: string
}

// 属性列表响应（完整版，应用于属性库管理菜单）
export interface ScmPropertyListResponseVo {
  id: string
  code: string
  name: string
  propertyType: string
  isRequired: boolean
  inputType: string
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
