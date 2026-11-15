import type { PageRequest } from '@/shared/types/Common.type'

/**
 * 跨模块共享的业务摘要 DTO。
 *
 * 背景：data 与 biam 互相引用对方的完整 DTO 会形成类型层循环，
 * 这里只保留跨模块展示/绑定所需的最小字段，完整 DTO 仍归各自模块所有。
 */

/** 组织摘要（门店挂载组织、用户归属组织等场景共用） */
export interface OrganizationSummaryDto {
  id: string
  parentId: string
  code: string
  name: string
  type: string
}

/** 门店摘要（组织绑定门店、用户关联门店等场景共用） */
export interface ShopSummaryDto {
  id: string
  name: string
  code?: string
}

/** 品牌摘要（SCM 品牌配置选择 data 品牌等跨域场景共用） */
export interface BrandSummaryDto {
  id: string
  name: string
  code?: string
  nameEn?: string
  status?: string
  parentId?: string
  createTime?: number
}

/** 品牌选择分页请求（SCM 配置选品牌时复用） */
export interface BrandSelectPageRequest extends PageRequest {
  code?: string
  name?: string
  namePinyinFull?: string
  namePinyinInitial?: string
  nameEn?: string
  status?: string
  categoryIdSet?: string[]
}

/** 用户摘要（跨域选择用户作为创建人/更新人等场景共用） */
export interface UserSummaryDto {
  id: string
  username: string
  name: string
  status?: string
  phone?: string
  createTime?: number
}
