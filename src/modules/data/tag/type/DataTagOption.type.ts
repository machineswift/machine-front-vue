// 创建智能标签选项请求参数
export interface DataTagOptionCreateRequestVo {
  tagId: string
  code: string
  name: string
  sort: number
  description?: string
}

// 修改智能标签选项请求参数
export interface DataTagOptionUpdateRequestVo {
  id: string
  name: string
  description?: string
}

// 修改智能标签选项编码请求参数
export interface DataTagOptionUpdateCodeRequestVo {
  id: string
  code: string
}

// 修改智能标签选项状态请求参数
export interface DataTagOptionUpdateStatusRequestVo {
  id: string
  status: string
}

// 修改智能标签选项排序请求参数
export interface DataTagOptionUpdateSortRequestVo {
  id: string
  sort: number
}

// 智能标签选项详情返回参数
export interface DataTagOptionDetailResponseVo {
  id: string
  tagId: string
  code: string
  name: string
  status: string
  sort: number
  description?: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}

// 智能标签选项查询请求参数
export interface DataTagOptionQueryListRequestVo {
  tagId: string
}

// 智能标签选项简单列表返回参数（应用于组件弹窗）
export interface DataTagOptionSimpleListResponseVo {
  id: string
  tagId: string
  code: string
  name: string
  status: string
  sort: number
}

// 智能标签选项扩展列表返回参数（应用于管理菜单）
export interface DataTagOptionExpandListResponseVo {
  id: string
  tagId: string
  code: string
  name: string
  status: string
  sort: number
  description?: string
  createBy?: string
  createName?: string
  createTime: number
  updateBy?: string
  updateName?: string
  updateTime: number
}
