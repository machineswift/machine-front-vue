/**
 * 字典枚举 key 常量
 *
 * 使用方式：
 *   enumStore.getEnumDataAsync(DICT_STATUS)
 *   enumStore.getEnumLabel(DICT_GENDER, code)
 */

// 通用
export const DICT_STATUS = 'StatusEnum'
export const DICT_GENDER = 'GenderEnum'

// 基础数据-地区/素材/下载/门店/标签
export const DICT_DATA_COUNTRY = 'DataCountryEnum'
export const DICT_DATA_FILE_TYPE = 'DataFileTypeEnum'
export const DICT_DATA_DOWNLOAD_STATUS = 'DataDownloadStatusEnum'
export const DICT_MODULE = 'ModuleEnum'
export const DICT_MODULE_ENTITY = 'ModuleEntityEnum'

// IAM
export const DICT_IAM_AUTH_GRANT_TYPE = 'BIamAuthorizationGrantTypeEnum'
export const DICT_IAM_AUTH_ACTION = 'BIamAuthActionEnum'
export const DICT_IAM_AUTH_METHOD = 'BIamAuthMethodEnum'
export const DICT_IAM_AUTH_RESULT = 'BIamAuthResultEnum'
export const DICT_IAM_ORG_TYPE = 'BIamOrganizationTypeEnum'
export const DICT_IAM_PERMISSION_RESOURCE_TYPE = 'BIamPermissionResourceTypeEnum'
export const DICT_IAM_DATA_PERMISSION_SCOPE_TYPE = 'BIamDataPermissionScopeTypeEnum'
export const DICT_IAM_ROLE_TYPE = 'BIamRoleTypeEnum'
export const DICT_IAM_USER_CONFIG_KEY = 'BIamUserConfigKeyEnum'
export const DICT_IAM_WEBHOOK_SUBSCRIPTION_ACTION = 'BIamWebhookSubscriptionActionEnum'
export const DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS = 'BIamWebhookDeliveryTaskStatusEnum'
export const DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_TYPE = 'BIamWebhookDeliveryAttemptTypeEnum'
export const DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_RESULT = 'BIamWebhookDeliveryAttemptResultEnum'
export const DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE = 'BIamWebhookCircuitBreakerStateEnum'
export const DICT_IAM_WEBHOOK_MONITOR_INTERVAL = 'BIamWebhookMonitorIntervalEnum'

// 基础数据-附件操作日志
export const DICT_DATA_ATTACHMENT_OPERATION_TYPE = 'DataAttachmentOperationTypeEnum'
export const DICT_DATA_ATTACHMENT_OPERATION_RESULT = 'DataAttachmentOperationResultEnum'

// 审计日志
export const DICT_OPERATE_SOURCE = 'OperateSourceEnum'
export const DICT_ACTION_TYPE = 'ActionTypeEnum'
export const DICT_ACTION_STATUS = 'ActionStatusEnum'
export const DICT_DATA_MATERIAL_PROCESS_STATUS = 'DataMaterialProcessStatusEnum'
export const DICT_DATA_MATERIAL_BUSINESS_STATUS = 'DataMaterialBusinessStatusEnum'
export const DICT_DATA_SHOP_BUSINESS_STATUS = 'DataShopBusinessStatusEnum'
export const DICT_DATA_SHOP_OPERATION_STATUS = 'DataShopOperationStatusEnum'
export const DICT_DATA_SHOP_PHYSICAL_STATUS = 'DataShopPhysicalStatusEnum'
export const DICT_PROFILE_SUBJECT_TYPE = 'ProfileSubjectTypeEnum'

// AI 资源中心
export const DICT_AI_PROVIDER = 'AiProviderEnum'
export const DICT_AI_MODEL_CAPABILITY = 'AiModelCapabilityEnum'
export const DICT_AI_MODEL_FEATURE = 'AiModelFeatureEnum'

// PCE
export const DICT_DATA_MATERIAL_AUDIT_STATUS = 'PceAuditStatusEnum'

// SCM 商品属性
export const DICT_SCM_ATTRIBUTE_TYPE = 'ScmAttributeTypeEnum'
export const DICT_SCM_ATTRIBUTE_INPUT_TYPE = 'ScmAttributeInputTypeEnum'
export const DICT_SCM_ATTRIBUTE_GROUP_TYPE = 'ScmAttributeGroupTypeEnum'
export const DICT_SCM_ITEM_INPUT_TYPE = 'ScmItemInputTypeEnum'

/**
 * 登录成功后预加载的核心枚举（覆盖大多数页面的通用枚举，避免首屏下拉空/闪烁）
 */
export const CORE_DICTIONARY_ENUM_NAMES = [DICT_STATUS, DICT_GENDER] as const
