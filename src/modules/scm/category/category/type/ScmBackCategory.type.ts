import type { HighlightRange, TreeNode } from '@/shared/types/Common.type'

export interface ScmBackCategoryCreateRequestVo {
  parentId: string
  name: string
  sort: number
}

export interface ScmBackCategoryUpdateRequestVo {
  id: string
  name: string
  sort: number
}

export interface ScmBackCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface ScmBackCategoryDetailResponseVo {
  id: string
  code: string
  name: string
  parentId: string
  sort: number
  frontCategoryIdSet?: string[]
  /** 关联的属性分组列表（含分组在该分类下的关联配置） */
  attributeGroupList?: ScmBackCategoryAttributeGroupItemResponseVo[]
  /** 关联的属性列表 */
  attributeList?: ScmBackCategoryAttributeItemResponseVo[]
  /** 关联的品牌列表 */
  brandList?: ScmBackCategoryBrandItemResponseVo[]
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

/** 后台分类详情中的关联属性分组项（含该分类下的关联配置） */
export interface ScmBackCategoryAttributeGroupItemResponseVo {
  id: string
  code: string
  name: string
  groupType: string
  status: string
  /** 该组在此后台分类下的排序，sort值大的排序靠前 */
  sort?: number
  /** 该组在此后台分类下是否必填 */
  requiredFlag?: boolean
  /** 该组在此后台分类下是否展示 */
  displayFlag?: boolean
  /** 该组在此后台分类下是否可搜索 */
  searchableFlag?: boolean
  /** 该组在此后台分类下的扩展特性JSON */
  features?: string
}

/** 后台分类关联的属性分组项（全量替换提交，只提交关联配置字段） */
export interface ScmBackCategoryAttributeGroupItemVo {
  groupId: string
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

/** 修改后台分类关联的属性分组请求（全量替换，传空列表表示清空关联） */
export interface ScmBackCategoryUpdateAttributeGroupRequestVo {
  id: string
  attributeGroupItemList: ScmBackCategoryAttributeGroupItemVo[]
}

export interface ScmBackCategoryTreeSimpleResponseVo extends TreeNode<ScmBackCategoryTreeSimpleResponseVo> {
  code: string
}

export interface ScmBackCategoryTreeExpandResponseVo extends TreeNode<ScmBackCategoryTreeExpandResponseVo> {
  code: string
  /** 关联的前台分类数（只统计直接关联，其余为 null） */
  frontCategoryNumber: number
  /** 子孙节点数 */
  backCategoryNumber: number
  /** 关联的属性分组数 */
  attributeGroupNumber: number
  /** 关联的属性数量 */
  attributeCount: number
  /** 关联的品牌数量 */
  brandNumber: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
  /** 搜索命中区间（渲染时再生成高亮节点，存储区间可避免 HTML 拼接与 XSS） */
  highlight?: { name?: HighlightRange[]; code?: HighlightRange[] }
}

/** 后台分类关联的属性项（详情响应） */
export interface ScmBackCategoryAttributeItemResponseVo {
  attributeId: string
  /** 属性编码 */
  code?: string
  /** 属性名称 */
  name?: string
  /** 属性类型 */
  attributeType?: string
  /** 输入方式 */
  inputType?: string
  /** 此类目下是否必填 */
  requiredFlag?: boolean
  /** 此类目下是否展示 */
  displayFlag?: boolean
  /** 此类目下是否可搜索 */
  searchableFlag?: boolean
  /** 排序，sort值大的排序靠前 */
  sort?: number
  /** 扩展特性JSON */
  features?: string
}

/** 后台分类关联的属性项（修改请求，只含关联配置字段） */
export interface ScmBackCategoryUpdateAttributeItemVo {
  attributeId: string
  /** 此类目下是否必填 */
  requiredFlag: boolean
  /** 此类目下是否展示 */
  displayFlag: boolean
  /** 此类目下是否可搜索 */
  searchableFlag: boolean
  /** 类目下属性排序，sort值大的排序靠前 */
  sort: number
  /** 扩展特性JSON */
  features?: string
}

/** 后台分类详情中的关联品牌项（含该分类下的关联配置） */
export interface ScmBackCategoryBrandItemResponseVo {
  brandId: string
  /** 品牌编码（响应填充） */
  code?: string
  /** 品牌名称（响应填充） */
  name?: string
  /** 关联状态 */
  status?: string
  /** 该类目下品牌是否必填 */
  requiredFlag?: boolean
  /** 该类目下是否展示 */
  displayFlag?: boolean
  /** 该类目下是否可搜索 */
  searchableFlag?: boolean
  /** 该类目下是否推荐 */
  recommendFlag?: boolean
  /** 类目下品牌排序，sort值大的排序靠前 */
  sort?: number
  /** 扩展特性JSON */
  features?: string
}

/** 修改后台分类关联的属性请求（全量替换，只提交关联配置字段） */
export interface ScmBackCategoryUpdateAttributeRequestVo {
  id: string
  attributeItemList: ScmBackCategoryUpdateAttributeItemVo[]
}
