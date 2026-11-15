// 创建属性请求
export interface ScmAttributeCreateRequestVo {
  name: string
  attributeType: string
  requiredFlag: boolean
  inputType: string
  multipleFlag: boolean
  searchableFlag: boolean
  features?: string
}

// 修改属性请求
export interface ScmAttributeUpdateRequestVo {
  id: string
  name: string
  requiredFlag: boolean
  multipleFlag: boolean
  searchableFlag: boolean
  features?: string
}

// 修改属性编码请求
export interface ScmAttributeUpdateCodeRequestVo {
  id: string
  code: string
}

// 属性关联的属性分组项
export interface ScmAttributeGroupItemVo {
  groupId: string
  /** 属性分组名称（响应填充） */
  groupName?: string
  /** 属性分组编码（响应填充） */
  groupCode?: string
  /** 该分组在此属性下是否必填 */
  requiredFlag: boolean
  /** 该分组在此属性下是否展示 */
  displayFlag: boolean
  /** 该分组在此属性下是否可搜索 */
  searchableFlag: boolean
  /** 该属性下属性分组排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 属性关联的后台分类项（详情响应）
export interface ScmAttributeBackCategoryItemVo {
  backCategoryId: string
  /** 后台分类编码（响应填充） */
  backCategoryCode?: string
  /** 后台分类全称（响应填充） */
  backCategoryFullName?: string
  /** 该属性在此类目下是否必填 */
  requiredFlag: boolean
  /** 该属性在此类目下是否展示 */
  displayFlag: boolean
  /** 该属性在此类目下是否可搜索 */
  searchableFlag: boolean
  /** 该属性在此类目下排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 属性关联的后台分类项（修改请求，只含关联配置字段）
export interface ScmAttributeUpdateBackCategoryItemVo {
  backCategoryId: string
  /** 该属性在此类目下是否必填 */
  requiredFlag: boolean
  /** 该属性在此类目下是否展示 */
  displayFlag: boolean
  /** 该属性在此类目下是否可搜索 */
  searchableFlag: boolean
  /** 该属性在此类目下排序，sort值大的排序靠前 */
  sort: number
  features?: string
}

// 修改属性关联的属性分组请求（全量替换）
export interface ScmAttributeUpdateAttributeGroupRequestVo {
  id: string
  attributeGroupItemList: ScmAttributeGroupItemVo[]
}

// 修改属性关联的后台分类请求（全量替换）
export interface ScmAttributeUpdateBackCategoryRequestVo {
  id: string
  backCategoryItemList: ScmAttributeUpdateBackCategoryItemVo[]
}

// 分页查询属性请求
export interface ScmAttributeQueryPageRequestVo {
  current?: number
  size?: number
  backCategoryIdSet?: string[]
  code?: string
  name?: string
  attributeType?: string
  inputType?: string
  searchableFlag?: boolean
}

// 属性详情响应
export interface ScmAttributeDetailResponseVo {
  id: string
  code: string
  name: string
  attributeType: string
  requiredFlag: boolean
  inputType: string
  multipleFlag: boolean
  searchableFlag: boolean
  features: string
  /** 关联的属性分组列表 */
  attributeGroupItemList: ScmAttributeGroupItemVo[]
  /** 关联的后台分类列表 */
  backCategoryList: ScmAttributeBackCategoryItemVo[]
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 属性列表响应（精简版，应用于组件弹窗/属性选择器）
export interface ScmAttributeSimpleListResponseVo {
  id: string
  code: string
  name: string
  attributeType: string
  inputType: string
}

// 属性列表响应（完整版，应用于属性库管理菜单）
export interface ScmAttributeListResponseVo {
  id: string
  code: string
  name: string
  attributeType: string
  requiredFlag: boolean
  inputType: string
  multipleFlag: boolean
  searchableFlag: boolean
  features: string
  /** 关联的属性分组数 */
  attributeGroupNumber: number
  /** 关联的后台分类数 */
  backCategoryNumber: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}
