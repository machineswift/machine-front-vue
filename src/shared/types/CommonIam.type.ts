/**
 * 数据权限元数据
 */
export interface DataPermissionMetaDto {
  functionCode: string
  functionName: string
  scopeList: DataPermissionMetaScopeDto[]
  /** 已选中的范围（前端勾选状态） */
  selectedScopes?: string[]
}

/**
 * 数据权限元数据范围信息
 */
export interface DataPermissionMetaScopeDto {
  scopeCode: string
  scopeName: string
}

/**
 * 数据权限规则DTO
 */
export interface DataPermissionRuleDto {
  functionCode: string
  scopeCode: string
  organizationNodeMap: Map<string, DataPermissionRuleOrganizationNodeDto>
}

/**
 * 数据权限规则组织信息
 */
export interface DataPermissionRuleOrganizationNodeDto {
  selectType: string
  organizationIdSet: string[]
}
