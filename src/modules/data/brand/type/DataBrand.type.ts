import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/** 临时文件创建参数（与后端 DataFileTempCreateDto 一致） */
export interface DataFileTempCreateDto {
  fileId: string
  sort?: number
  features?: string
}

/** 新增品牌 */
export interface DataBrandCreateRequestVo {
  /** 父品牌ID，为空表示一级品牌 */
  parentId?: string
  name: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  sort?: number
  /** LOGO 临时文件（必填） */
  logoFile: DataFileTempCreateDto
  description?: string
}

/** 修改品牌（不传 logoFile 表示不修改 LOGO） */
export interface DataBrandUpdateRequestVo {
  id: string
  name: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  sort?: number
  logoFile?: DataFileTempCreateDto
  description?: string
}

/** 修改品牌状态 */
export interface DataBrandUpdateStatusRequestVo {
  id: string
  status: string
}

/** 修改品牌父节点（parentId 传 root 表示移到一级） */
export interface DataBrandUpdateParentRequestVo {
  id: string
  parentId: string
}

/** 修改品牌分类 */
export interface DataBrandUpdateCategoryRequestVo {
  id: string
  categoryIdSet?: string[]
}

/** 品牌分页查询 */
export interface DataBrandQueryPageRequestVo extends PageRequest {
  code?: string
  name?: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  status?: string
  /** 品牌分类集合 */
  categoryIdSet?: string[]
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
}

/** 查询子品牌（必传 parentId，顶层传 root） */
export interface DataBrandQueryChildrenRequestVo extends PageRequest {
  parentId: string
  /** 品牌分类集合 */
  categoryIdSet?: string[]
}

/** 品牌精简列表项（page_simple / children_simple，带 children 时是树） */
export interface DataBrandSimpleListResponseVo {
  id: string
  parentId?: string
  name: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  sort?: number
  code?: string
  status?: string
  logoAttachmentId?: string
  /** 描述 */
  description?: string
  createTime?: number
  hasChildren?: boolean
  children?: DataBrandSimpleListResponseVo[]
}

/** 品牌详情 */
export interface DataBrandDetailResponseVo {
  id: string
  /** 父品牌ID（root 表示一级品牌） */
  parentId?: string
  code?: string
  /** 品牌全称（父品牌-子品牌） */
  fullName?: string
  name: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  status: string
  sort?: number
  /** LOGO 附件ID，取地址走附件接口 */
  logoAttachmentId?: string
  description?: string
  /** 所属分类ID集合 */
  categoryIdSet?: string[]
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

/** 品牌展开列表项（page_expand / children_expand，带 children 时是树） */
export interface DataBrandExpandListResponseVo {
  id: string
  parentId?: string
  name: string
  /** 拼音全拼 */
  namePinyinFull?: string
  /** 拼音首字母 */
  namePinyinInitial?: string
  /** 英文名称 */
  nameEn?: string
  sort?: number
  code?: string
  status?: string
  logoAttachmentId?: string
  description?: string
  /** 所属分类ID集合 */
  categoryIdSet?: string[]
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
  hasChildren?: boolean
  children?: DataBrandExpandListResponseVo[]
}

export type DataBrandSimplePageResponse = PageResponse<DataBrandSimpleListResponseVo>
export type DataBrandExpandPageResponse = PageResponse<DataBrandExpandListResponseVo>
