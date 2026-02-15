import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'
import type { AddressInfoDto } from '@/modules/common/types/CommonData.type'
import type { IamOrganizationDto } from '@/modules/iam/organization/type/IamOrganization.type'
import type { LabelOptionDto } from '@/modules/data/label/type/DataLabelOption.type'

export interface DataShopDto {
  id: string
  name: string
  code: string
  status: string
  type: string
}

/**
 * 门店门头照
 */
export interface DataShopDto {
  storeFrontMaterialIdList: string[]
  frontDeskMaterialIdList: string[]
}

/**
 * 门店营业执照
 */
export interface DataShopBusinessLicenseDto {
  impendingReminderRule: number
  unifiedSocialCreditCode: string
  enterpriseName: string
  issueDate: number
  expiryDate: number
  legalPersonName: string
  enterpriseAddress: AddressInfoDto
  materialIdList: string[]
}

/**
 * 食品经营许可证
 */
export interface DataShopFoodBusinessLicenseDto {
  impendingReminderRule: number
  unifiedSocialCreditCode: string
  enterpriseName: string
  issueDate: number
  expiryDate: number
  legalPersonName: string
  enterpriseAddress: AddressInfoDto
  materialIdList: string[]
}

/**
 * 消杀合同
 */
export interface DataShopDisinfectingContractDto {
  impendingReminderRule: number
  contractCode: string
  contractName: string
  issueDate: number
  expiryDate: number
  contractMaterialList: string[]
}

/**
 * 营业执照
 */
export interface DataShopBusinessLicenseResponseVo {
  certificateStatus: number
  temporaryBusinessLicense: DataShopBusinessLicenseDto
  permanentBusinessLicense: DataShopBusinessLicenseDto
}

/**
 * 食品经营许可证
 */
export interface DataShopFoodBusinessLicenseResponseVo {
  certificateStatus: number
  temporaryFoodBusinessLicense: DataShopFoodBusinessLicenseDto
  permanentFoodBusinessLicense: DataShopFoodBusinessLicenseDto
}

/**
 * 消杀合同
 */
export interface DataShopDisinfectingContractResponseVo {
  certificateStatus: number
  temporaryDisinfectingContract: DataShopDisinfectingContractDto
  permanentDisinfectingContract: DataShopDisinfectingContractDto
}

/**
 * 门头照
 */
export interface DataShopFrontPhotoResponseVo {
  certificateStatus: number
  temporaryShopFrontPhoto: DataShopFrontPhotoDto
  permanentShopFrontPhoto: DataShopFrontPhotoDto
}

export interface DataShopCreateRequestVo {
  name: string
  addressInfo?: AddressInfoDto
  latitude: number
  longitude: number
  description: string
}

export interface DataShopUpdateRequestVo {
  id: string
  name: string
  addressInfo?: AddressInfoDto
  latitude: number
  longitude: number
  description: string
}

export interface DataShopUpdateShopBusinessStatusRequestVo {
  id: string
  businessStatus: string
}

export interface DataShopUpdateShopOperationStatusRequestVo {
  id: string
  operationStatus: string
}

export interface DataShopUpdateShopPhysicalStatusRequestVo {
  id: string
  physicalStatus: string
}

export interface DataShopUpdateShopLabelOptionRequestVo {
  id: string
  labelOptionIdSet: string[]
}

export interface DataShopBatchUpdateShopLabelOptionRequestVo {
  labelOptionIdId: string
  shopIdSet: string[]
}

/**
 * 修改门店证件
 */
export interface DataShopUpdateCertificateRequestVo {
  id: string
  businessLicense: DataShopBusinessLicenseResponseVo
  foodBusinessLicense: DataShopFoodBusinessLicenseResponseVo
  disinfectingContract: DataShopDisinfectingContractResponseVo
  frontPhoto: DataShopFrontPhotoResponseVo
}

export interface DataShopBindOrganizationRequestVo {
  shopIdSet: string[]
  organizationId: string
}

export interface DataShopDetailResponseVo {
  id: string
  code: string
  name: string
  businessStatus: string
  operationStatus: string
  physicalStatus: string
  addressInfo?: AddressInfoDto
  latitude: number
  longitude: number
  description: string
  organizationList: IamOrganizationDto[]
  labelOptionList: LabelOptionDto[]
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

/**
 * 查询门店证件
 */
export interface DataShopCertificateResponseVo {
  id: string
  businessLicense: DataShopBusinessLicenseResponseVo
  foodBusinessLicense: DataShopFoodBusinessLicenseResponseVo
  disinfectingContract: DataShopDisinfectingContractResponseVo
  frontPhoto: DataShopFrontPhotoResponseVo
}

// 门店分页查询接口请求参数
export interface DataShopQueryPageRequestVo extends PageRequest {
  code: string
  name: string
  businessStatusSet: string[]
  operationStatusSet: string[]
  physicalStatusSet: string[]
  countryCode: string
  areaCodeSet: string[]
  organizationType: string
  organizationIdSet?: string[]
  labelOptionIdSet?: string[]
}

/** 门店导出请求参数（与查询条件一致，可选 shopIdSet） */
export interface DataShopExportRequestVo {
  shopIdSet?: string[]
  code?: string
  name?: string
  businessStatusSet?: string[]
  operationStatusSet?: string[]
  physicalStatusSet?: string[]
  countryCode?: string
  areaCodeSet?: string[]
  organizationType?: string
  organizationIdSet?: string[]
  labelOptionIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 门店分页查询接口返回参数
export interface DataShopSimpleListResponseVo {
  id: string
  code: string
  name: string

  businessStatus: string

  operationStatus: string

  physicalStatus: string
  createTime: number
  updateTime: number
}

export interface DataShopExpandListResponseVo {
  id: string
  code: string
  name: string
  businessStatus: string
  operationStatus: string
  physicalStatus: string
  addressInfo?: AddressInfoDto
  latitude: number
  longitude: number
  description: string
  labelOptionList: LabelOptionDto[]
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type DataShopSimplePageResponse = PageResponse<DataShopSimpleListResponseVo>
export type DataShopExpandPageResponse = PageResponse<DataShopExpandListResponseVo>
