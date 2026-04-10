import type { TreeNode } from '@/modules/common/types/Common.type'

/** 创建素材分类 */
export interface DataMaterialCategoryCreateRequestVo {
  parentId: string
  name: string
  sort?: number
}

/** 修改父分类 */
export interface DataMaterialCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

/** 修改素材分类 */
export interface DataMaterialCategoryUpdateRequestVo {
  id: string
  name: string
  sort?: number
}

/** 素材分类详情 */
export interface DataMaterialCategoryDetailResponseVo {
  id?: string
  parentId?: string
  code?: string
  name?: string
  sort?: number
}

/** 素材分类简单树（选择器） */
export interface DataMaterialCategorySimpleTreeResponseVo extends TreeNode<DataMaterialCategorySimpleTreeResponseVo> {
  code: string
}
