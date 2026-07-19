import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/** 文件类型（与后端 DataFileTypeEnum 一致，传字符串） */
export type DataFileTypeEnum = string

/** 系统处理状态（与后端 DataMaterialProcessStatusEnum 一致） */
export type DataMaterialProcessStatusEnum = string

/** 业务状态（与后端 DataMaterialBusinessStatusEnum 一致） */
export type DataMaterialBusinessStatusEnum = string

/** 审核状态（与后端 DataMaterialAuditStatusEnum 一致） */
export type DataMaterialAuditStatusEnum = string

/** 临时文件创建参数（与后端 DataFileTempCreateDto 一致） */
export interface DataFileTempCreateDto {
  fileId: string
  sort?: number
  features?: string
}

/** 新增素材 */
export interface DataMaterialCreateRequestVo {
  fileType: DataFileTypeEnum
  title: string
  fileTemp: DataFileTempCreateDto
  categoryIdSet?: string[]
}

/** 更新素材 */
export interface DataMaterialUpdateRequestVo {
  id: string
  title: string
  categoryIdSet?: string[]
  fileTemp?: DataFileTempCreateDto
}

/** 修改素材分类 */
export interface DataMaterialUpdateCategoryRequestVo {
  id: string
  categoryIdSet?: string[]
}

/** 素材分页查询（管理端） */
export interface DataMaterialQueryPageRequestVo extends PageRequest {
  /** 文件类型集合，多选；为空则不按文件类型过滤 */
  fileTypeSet?: DataFileTypeEnum[]
  title?: string
  name?: string
  processStatus?: DataMaterialProcessStatusEnum
  businessStatus?: DataMaterialBusinessStatusEnum
  auditStatus?: DataMaterialAuditStatusEnum
  categoryIdSet?: string[]
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  updateStartTime?: number
  updateEndTime?: number
  createStartTime?: number
  createEndTime?: number
}

/** 素材详情 */
export interface DataMaterialDetailResponseVo {
  id?: string
  attachmentId?: string
  fileType?: DataFileTypeEnum
  processStatus?: DataMaterialProcessStatusEnum
  businessStatus?: DataMaterialBusinessStatusEnum
  auditStatus?: DataMaterialAuditStatusEnum
  title?: string
  categoryIdSet?: string[]
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

/** 素材分页列表项（管理端展开） */
export interface DataMaterialExpandListResponseVo {
  id?: string
  attachmentId?: string
  fileType?: DataFileTypeEnum
  processStatus?: DataMaterialProcessStatusEnum
  businessStatus?: DataMaterialBusinessStatusEnum
  auditStatus?: DataMaterialAuditStatusEnum
  title?: string
  categoryIdSet?: string[]
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

export type DataMaterialExpandPageResponse = PageResponse<DataMaterialExpandListResponseVo>
