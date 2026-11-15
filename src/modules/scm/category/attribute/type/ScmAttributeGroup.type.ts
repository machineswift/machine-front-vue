import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

// 创建属性分组请求
export interface ScmAttributeGroupCreateRequestVo {
  name: string
  groupType: string
  features?: string
}

// 修改属性分组请求
export interface ScmAttributeGroupUpdateRequestVo {
  id: string
  name: string
  features?: string
}

// 修改属性分组状态请求
export interface ScmAttributeGroupUpdateStatusRequestVo {
  id: string
  status: string
}

// 修改属性分组编码请求
export interface ScmAttributeGroupUpdateCodeRequestVo {
  id: string
  code: string
}

// 属性分组关联的后台分类项（详情响应）
export interface ScmAttributeGroupBackCategoryItemVo {
  backCategoryId: string
  /** 该组在此类目下是否必填 */
  requiredFlag: boolean
  /** 该组在此类目下是否展示 */
  displayFlag: boolean
  /** 该组在此类目下是否可搜索 */
  searchableFlag: boolean
  /** 类目下属性组排序，sort值大的排序靠前 */
  sort: number
  features?: string
  /** 后台分类全称（响应填充，前端别名编辑用） */
  backCategoryFullName?: string
}

// 属性分组关联的后台分类项（修改请求，只含关联配置字段）
export interface ScmAttributeGroupUpdateBackCategoryItemVo {
  backCategoryId: string
  /** 该组在此类目下是否必填 */
  requiredFlag: boolean
  /** 该组在此类目下是否展示 */
  displayFlag: boolean
  /** 该组在此类目下是否可搜索 */
  searchableFlag: boolean
  /** 类目下属性组排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 修改属性分组关联的后台分类请求（全量替换）
export interface ScmAttributeGroupUpdateBackCategoryRequestVo {
  id: string
  backCategoryItemList: ScmAttributeGroupUpdateBackCategoryItemVo[]
}

// 属性分组关联的属性项（详情响应）
export interface ScmAttributeGroupAttributeItemVo {
  attributeId: string
  /** 属性编码（响应填充） */
  code?: string
  /** 属性名称（响应填充） */
  name?: string
  /** 属性类型（响应填充） */
  attributeType?: string
  /** 输入方式（响应填充） */
  inputType?: string
  /** 组内是否必填 */
  requiredFlag: boolean
  /** 组内是否展示 */
  displayFlag: boolean
  /** 组内是否可搜索 */
  searchableFlag: boolean
  /** 组内排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 属性分组关联的属性项（修改请求，只含关联配置字段）
export interface ScmAttributeGroupUpdateAttributeItemVo {
  attributeId: string
  /** 组内是否必填 */
  requiredFlag: boolean
  /** 组内是否展示 */
  displayFlag: boolean
  /** 组内是否可搜索 */
  searchableFlag: boolean
  /** 组内排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 修改属性分组关联的属性请求（全量替换）
export interface ScmAttributeGroupUpdateAttributeRequestVo {
  id: string
  attributeItemList: ScmAttributeGroupUpdateAttributeItemVo[]
}

// 查询属性分组列表请求（应用于组件弹窗）
export interface ScmAttributeGroupQueryListRequestVo {
  /** 所属后台类目ID（叶子类目） */
  backCategoryId: string
}

// 分页查询属性分组请求（应用于属性分组管理菜单）
export interface ScmAttributeGroupQueryPageRequestVo extends PageRequest {
  backCategoryIdSet?: string[]
  code?: string
  name?: string
  groupType?: string
  status?: string
}

// 属性分组列表响应（基础信息版，应用于组件弹窗分页）
export interface ScmAttributeGroupSimpleListResponseVo {
  id: string
  code: string
  name: string
  groupType: string
  status: string
}

// 属性分组列表响应（完整版，应用于属性分组管理菜单）
export interface ScmAttributeGroupListResponseVo {
  id: string
  code: string
  name: string
  groupType: string
  status: string
  /** 关联的后台分类数量 */
  backCategoryCount: number
  /** 关联的属性数量 */
  attributeCount: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 属性分组详情响应
export interface ScmAttributeGroupDetailResponseVo {
  id: string
  code: string
  name: string
  groupType: string
  status: string
  features: string
  backCategoryItemList: ScmAttributeGroupBackCategoryItemVo[]
  attributeItemList: ScmAttributeGroupAttributeItemVo[]
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export type ScmAttributeGroupPageResponse = PageResponse<ScmAttributeGroupListResponseVo>
export type ScmAttributeGroupSimplePageResponse = PageResponse<ScmAttributeGroupSimpleListResponseVo>
