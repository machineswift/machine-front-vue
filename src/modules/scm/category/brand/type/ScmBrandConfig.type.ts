import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/** 新增品牌配置 */
export interface ScmBrandConfigCreateRequestVo {
  /** 品牌ID */
  brandId: string
  /** 状态（StatusEnum） */
  status: string
  /** 扩展特性JSON */
  features?: string
}

/** 修改品牌配置 */
export interface ScmBrandConfigUpdateRequestVo {
  id: string
  /** 扩展特性JSON */
  features?: string
}

/** 修改品牌配置状态 */
export interface ScmBrandConfigUpdateStatusRequestVo {
  id: string
  /** 状态（StatusEnum） */
  status: string
}

/** 品牌配置关联后台分类项（只含关联配置字段） */
export interface ScmBrandConfigBackCategoryItemVo {
  backCategoryId: string
  /** 该品牌在此分类下是否必填 */
  requiredFlag: boolean
  /** 该品牌在此分类下是否展示 */
  displayFlag: boolean
  /** 该品牌在此分类下是否可搜索 */
  searchableFlag: boolean
  /** 该品牌在此分类下是否推荐 */
  recommendFlag: boolean
  /** 分类下品牌排序，sort值大的排序靠前 */
  sort: number
  /** 扩展特性JSON */
  features?: string
}

/** 修改品牌配置关联后台分类请求（全量替换，传空列表表示清空关联） */
export interface ScmBrandConfigUpdateBackCategoryRequestVo {
  brandId: string
  backCategoryItemList: ScmBrandConfigBackCategoryItemVo[]
}

/** 品牌配置分页查询（应用于管理菜单） */
export interface ScmBrandConfigQueryPageRequestVo extends PageRequest {
  /** 品牌编码 */
  code?: string
  /** 品牌名称 */
  name?: string
  /** 品牌名称拼音全拼 */
  namePinyinFull?: string
  /** 品牌名称拼音首字母 */
  namePinyinInitial?: string
  /** 品牌英文名称 */
  nameEn?: string
  /** 关联的后台分类ID集合 */
  backCategoryIdSet?: string[]
  /** 状态（StatusEnum） */
  status?: string
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
  /** 深分页游标，超过 offset 上限后原样回传 */
  searchAfterToken?: string
}

/** 品牌配置列表项（page_expand） */
export interface ScmBrandConfigListResponseVo {
  id: string
  brandId: string
  /** 品牌编码 */
  code?: string
  /** 品牌名称 */
  name?: string
  /** 品牌名称拼音全拼 */
  namePinyinFull?: string
  /** 品牌名称拼音首字母 */
  namePinyinInitial?: string
  /** SCM侧状态（StatusEnum） */
  status?: string
  /** 关联的后台类目数 */
  backCategoryNumber?: number
  /** 扩展特性JSON */
  features?: string
  createBy?: string
  createName?: string
  createTime?: number
  updateBy?: string
  updateName?: string
  updateTime?: number
}

/** 品牌配置详情中的关联后台分类项 */
export interface ScmBrandConfigBackCategoryRelationItem {
  /** 关联ID */
  id: string
  backCategoryId: string
  /** 冗余后台分类编码 */
  backCategoryCode?: string
  /** 后台分类全称 */
  backCategoryFullName?: string
  /** 状态（StatusEnum） */
  status?: string
  requiredFlag?: boolean
  displayFlag?: boolean
  searchableFlag?: boolean
  recommendFlag?: boolean
  /** 类目下品牌排序，sort值大的排序靠前 */
  sort?: number
  features?: string
  createBy?: string
  createTime?: number
  updateBy?: string
  updateTime?: number
}

/** 品牌配置详情 */
export interface ScmBrandConfigDetailResponseVo {
  id: string
  brandId: string
  /** 品牌编码 */
  code?: string
  /** 品牌名称 */
  name?: string
  /** 品牌名称拼音全拼 */
  namePinyinFull?: string
  /** 品牌名称拼音首字母 */
  namePinyinInitial?: string
  /** SCM侧状态（StatusEnum） */
  status?: string
  /** 关联的后台类目与品牌配置列表 */
  backCategoryItemList?: ScmBrandConfigBackCategoryRelationItem[]
  /** 扩展特性JSON */
  features?: string
  createBy?: string
  createName?: string
  createTime?: number
  updateBy?: string
  updateName?: string
  updateTime?: number
}

export type ScmBrandConfigPageResponse = PageResponse<ScmBrandConfigListResponseVo>
