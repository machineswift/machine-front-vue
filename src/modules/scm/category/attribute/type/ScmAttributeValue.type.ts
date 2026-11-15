// 创建属性值请求
export interface ScmAttributeValueCreateRequestVo {
  attributeId: string
  code: string
  name: string
  value?: string
  sort: number
  features?: string
}

// 修改属性值请求
export interface ScmAttributeValueUpdateRequestVo {
  id: string
  name: string
  value?: string
  sort: number
  features?: string
}

// 修改属性值状态请求
export interface ScmAttributeValueUpdateStatusRequestVo {
  id: string
  status: string
}

// 修改属性值编码请求
export interface ScmAttributeValueUpdateCodeRequestVo {
  id: string
  code: string
}

// 根据属性ID查询枚举值列表请求
export interface ScmAttributeValueListByAttributeRequestVo {
  attributeId: string
}

// 属性值列表响应（组件弹窗）
export interface ScmAttributeValueSimpleListResponseVo {
  id: string
  attributeId: string
  code: string
  name: string
  value?: string
  sort: number
  status: string
}

// 属性值列表响应
export interface ScmAttributeValueListResponseVo {
  id: string
  attributeId: string
  code: string
  name: string
  value?: string
  sort: number
  status: string
  features?: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}
