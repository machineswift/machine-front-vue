import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

// 创建智能标签请求参数
export interface DataTagCreateRequestVo {
  categoryId: string
  code: string
  name: string
  sort: number
  description?: string
}

// 修改智能标签请求参数
export interface DataTagUpdateRequestVo {
  id: string
  name: string
  description?: string
}

// 修改智能标签编码请求参数
export interface DataTagUpdateCodeRequestVo {
  id: string
  code: string
}

// 修改智能标签状态请求参数
export interface DataTagUpdateStatusRequestVo {
  id: string
  status: string
}

// 修改智能标签排序请求参数
export interface DataTagUpdateSortRequestVo {
  id: string
  sort: number
}

// 修改智能标签关联分类请求参数
export interface DataTagUpdateCategoryRequestVo {
  id: string
  categoryId: string
}

// 智能标签详情返回参数
export interface DataTagDetailResponseVo {
  id: string
  categoryId: string
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

// 智能标签简单列表返回参数（应用于组件弹窗）
export interface DataTagSimpleListResponseVo {
  id: string
  categoryId: string
  code: string
  name: string
  status: string
  sort: number
}

// 智能标签扩展列表返回参数（应用于管理菜单）
export interface DataTagExpandListResponseVo {
  id: string
  categoryId: string
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

// 智能标签分页查询接口请求参数
export interface DataTagQueryPageRequestVo extends PageRequest {
  type: string
  categoryIdSet?: string[]
  code?: string
  name?: string
}

// 分页响应类型
export type DataTagSimplePageResponse = PageResponse<DataTagSimpleListResponseVo>
export type DataTagExpandPageResponse = PageResponse<DataTagExpandListResponseVo>
