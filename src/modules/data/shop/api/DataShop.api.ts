import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataShopCreateRequestVo,
  DataShopUpdateRequestVo,
  DataShopUpdateShopBusinessStatusRequestVo,
  DataShopUpdateShopOperationStatusRequestVo,
  DataShopUpdateShopPhysicalStatusRequestVo,
  DataShopUpdateCertificateRequestVo,
  DataShopUpdateShopLabelOptionRequestVo,
  DataShopBatchUpdateShopLabelOptionRequestVo,
  DataShopBindOrganizationRequestVo,
  DataShopDetailResponseVo,
  DataShopCertificateResponseVo,
  DataShopQueryPageRequestVo,
  DataShopExportRequestVo,
  DataShopSimplePageResponse,
  DataShopExpandPageResponse
} from '@/modules/data/shop/type/DataShop.type'

// 创建门店
const create = async (params: DataShopCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/shop/create', params)
}

// 修改
const update = async (params: DataShopUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update', params)
}

// 修改门店经营状态
const updateBusinessStatus = async (params: DataShopUpdateShopBusinessStatusRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update_business_status', params)
}

// 修改门店运营状态
const updateOperationStatus = async (params: DataShopUpdateShopOperationStatusRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update_operation_status', params)
}

// 修改门店物理状态
const updatePhysicalStatus = async (params: DataShopUpdateShopPhysicalStatusRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update_physical_status', params)
}

// 修改门店证件
const updateCertificate = async (params: DataShopUpdateCertificateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update_certificate', params)
}

// 修改门店标签选项
const updateLabelOption = async (params: DataShopUpdateShopLabelOptionRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/update_label_option', params)
}

// 批量修改门店标签选项
const batchUpdateLabelOption = async (params: DataShopBatchUpdateShopLabelOptionRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/batch_update_label_option', params)
}

// 门店绑定组织
const bindOrganization = async (params: DataShopBindOrganizationRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/shop/bind_organization', params)
}

// 门店详情
const detail = async (params: IdRequest): Promise<DataShopDetailResponseVo> => {
  return request.post<DataBrandDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/shop/detail', params)
}

// 查询门店证件
const getCertificate = async (params: IdRequest): Promise<DataShopCertificateResponseVo> => {
  return request.post<DataShopCertificateResponseVo>(MANAGE_API_BASE_URL + 'manage/data/shop/get_certificate', params)
}

// 分页查询门店(应用于组件弹窗)
const pageSimple = async (params: DataShopQueryPageRequestVo): Promise<DataBrandSimplePageResponse> => {
  return request.post<DataShopSimplePageResponse>(MANAGE_API_BASE_URL + 'manage/data/shop/page_simple', params)
}

// 分页查询门店(应用于角色管理菜单)
const pageExpand = async (params: DataShopQueryPageRequestVo): Promise<DataBrandExpandPageResponse> => {
  return request.post<DataShopExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/shop/page_expand', params)
}

// 导出门店（按条件或按选中 shopIdSet，任务创建后到下载中心查看）
const exportShop = async (params: DataShopExportRequestVo): Promise<void> => {
  return request.post<void>(MANAGE_API_BASE_URL + 'manage/data/shop/export', params)
}

export const DataShopApi = {
  create,
  update,
  updateBusinessStatus,
  updateOperationStatus,
  updatePhysicalStatus,
  updateCertificate,
  updateLabelOption,
  batchUpdateLabelOption,
  bindOrganization,
  detail,
  getCertificate,
  pageSimple,
  pageExpand,
  exportShop
}
