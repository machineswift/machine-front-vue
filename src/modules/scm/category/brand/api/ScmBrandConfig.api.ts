import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse, PageResponse } from '@/shared/types/Common.type'
import type { BrandSelectPageRequest, BrandSummaryDto } from '@/shared/types/CommonBusiness.type'
import type {
  ScmBrandConfigCreateRequestVo,
  ScmBrandConfigUpdateRequestVo,
  ScmBrandConfigUpdateStatusRequestVo,
  ScmBrandConfigUpdateBackCategoryRequestVo,
  ScmBrandConfigQueryPageRequestVo,
  ScmBrandConfigDetailResponseVo,
  ScmBrandConfigPageResponse
} from '@/modules/scm/category/brand/type/ScmBrandConfig.type'

// 创建品牌配置
const create = async (params: ScmBrandConfigCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/scm/brand_config/create'), params)
}

// 删除品牌配置
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/scm/brand_config/delete'), params)
}

// 修改品牌配置
const update = async (params: ScmBrandConfigUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/brand_config/update'), params)
}

// 修改品牌配置状态
const updateStatus = async (params: ScmBrandConfigUpdateStatusRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/brand_config/update_status'), params)
}

// 修改品牌配置关联后台分类（全量替换）
const updateBackCategory = async (params: ScmBrandConfigUpdateBackCategoryRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/brand_config/update_back_category'), params)
}

// 查询品牌配置详情
const detail = async (params: IdRequest): Promise<ScmBrandConfigDetailResponseVo> => {
  return request.post<ScmBrandConfigDetailResponseVo>(adminApi('admin/scm/brand_config/detail'), params)
}

// 分页查询品牌配置（应用于管理菜单）
const pageExpand = async (params: ScmBrandConfigQueryPageRequestVo): Promise<ScmBrandConfigPageResponse> => {
  return request.post<ScmBrandConfigPageResponse>(adminApi('admin/scm/brand_config/page_expand'), params)
}

// 分页查询可选品牌（排除已建立配置的品牌，应用于新增品牌配置）
const pageSelectable = async (params: BrandSelectPageRequest): Promise<PageResponse<BrandSummaryDto>> => {
  return request.post<PageResponse<BrandSummaryDto>>(adminApi('admin/scm/brand_config/page_selectable'), params)
}

export const ScmBrandConfigApi = {
  create,
  destroy,
  update,
  updateStatus,
  updateBackCategory,
  detail,
  pageExpand,
  pageSelectable
}
