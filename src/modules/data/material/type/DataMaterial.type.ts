import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/** 临时文件创建参数（与后端 DataFileTempCreateDto 一致） */
export interface DataFileTempCreateDto {
  fileId: string
  sort?: number
  features?: string
}

/** 新增素材 */
export interface DataMaterialCreateRequestVo {
  fileType: string
  title: string
  fileTemp: DataFileTempCreateDto
}

/** 更新素材 */
export interface DataMaterialUpdateRequestVo {
  id: string
  title: string
  fileTemp?: DataFileTempCreateDto
  /** 变更说明（本次变更的原因），更换附件时随新版本记录到版本历史 */
  changeDesc?: string
}

/** 修改素材分类 */
export interface DataMaterialUpdateCategoryRequestVo {
  id: string
  categoryIdSet?: string[]
}

/** 素材分页查询（管理端） */
export interface DataMaterialQueryPageRequestVo extends PageRequest {
  /** 文件类型集合，多选；为空则不按文件类型过滤 */
  fileTypeSet?: string[]
  title?: string
  processStatus?: string
  businessStatus?: string
  auditStatus?: string
  categoryIdSet?: string[]
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  updateStartTime?: number
  updateEndTime?: number
  createStartTime?: number
  createEndTime?: number
}

/** 素材引用明细 */
export interface DataMaterialReferenceResponseVo {
  entity?: string
  entityId?: string
  createTime?: number
  updateTime?: number
}

/** 素材详情 */
export interface DataMaterialDetailResponseVo {
  id?: string
  attachmentId?: string
  fileType?: string
  processStatus?: string
  businessStatus?: string
  auditStatus?: string
  title?: string
  originalName?: string
  size?: number
  versionNo?: number
  categoryIdSet?: string[]
  referenceCount?: number
  referenceList?: DataMaterialReferenceResponseVo[]
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
  fileType?: string
  processStatus?: string
  businessStatus?: string
  auditStatus?: string
  title?: string
  originalName?: string
  size?: number
  versionNo?: number
  categoryIdSet?: string[]
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

export type DataMaterialExpandPageResponse = PageResponse<DataMaterialExpandListResponseVo>
