<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="客户端详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
    overlay-class="client-detail-overlay"
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="客户端ID">{{ state.detailData.clientId }}</el-descriptions-item>
        <el-descriptions-item label="授权方式">
          <el-tag :type="grantTypeTagType" effect="plain">{{ grantTypeLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户端名称">{{ state.detailData.clientName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
            {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="作用域" :span="2">
          <div class="tag-list">
            <template v-for="scope in state.detailData.scopes" :key="scope">
              <!-- 客户端凭证模式：作用域为角色ID，展示角色名称，悬浮可查看原始ID -->
              <el-tooltip v-if="isClientCredentials && roleNameMap.has(scope)" :content="scope" placement="top">
                <el-tag type="success" effect="light" round class="scope-tag">
                  {{ roleNameMap.get(scope) }}
                </el-tag>
              </el-tooltip>
              <el-tag v-else type="success" effect="light" round>
                {{ scope }}
              </el-tag>
            </template>
            <span v-if="!state.detailData.scopes?.length" class="detail-empty">无</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item v-if="isAuthorizationCode" label="重定向URI" :span="2">
          <div class="uri-tag-list">
            <el-tag v-for="uri in state.detailData.redirectUris" :key="uri" type="primary" effect="plain" class="uri-tag">
              {{ uri }}
            </el-tag>
            <span v-if="!state.detailData.redirectUris?.length" class="detail-empty">无</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item v-if="isAuthorizationCode" label="登出后重定向URI" :span="2">
          <div class="uri-tag-list">
            <el-tag v-for="uri in state.detailData.postLogoutRedirectUris" :key="uri" type="warning" effect="plain" class="uri-tag">
              {{ uri }}
            </el-tag>
            <span v-if="!state.detailData.postLogoutRedirectUris?.length" class="detail-empty">无</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="IP白名单" :span="2">
          <div class="tag-list">
            <el-tag v-for="ip in state.detailData.allowedIps" :key="ip" type="info" effect="plain" round>
              {{ ip }}
            </el-tag>
            <span v-if="!state.detailData.allowedIps?.length" class="detail-empty">不限制（允许所有来源 IP）</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="修改时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive, ref } from 'vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_AUTH_GRANT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/identityCenter/registeredClient/api/BIamAuth2RegisteredClient.api'
  import { BIamRoleApi } from '@/modules/biam/accessControl/role/api/BIamRole.api'
  import type { BIamRoleSimpleListResponseVo } from '@/modules/biam/accessControl/role/type/BIamRole.type'
  import type { BIamAuth2RegisteredClientDetailResponseVo } from '@/modules/biam/identityCenter/registeredClient/type/BIamAuth2RegisteredClient.type'

  const enumStore = useDictionaryEnumStore()

  const DEFAULT_DETAIL_DATA: BIamAuth2RegisteredClientDetailResponseVo = {
    id: '',
    authorizationGrantType: '',
    status: '',
    clientId: '',
    clientName: '',
    scopes: [],
    allowedIps: [],
    redirectUris: [],
    postLogoutRedirectUris: [],
    createBy: '',
    createName: '',
    createTime: 0,
    updateBy: '',
    updateName: '',
    updateTime: 0
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    clientId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    detailData: {
      ...DEFAULT_DETAIL_DATA,
      scopes: [...DEFAULT_DETAIL_DATA.scopes],
      redirectUris: [...DEFAULT_DETAIL_DATA.redirectUris!],
      postLogoutRedirectUris: [...DEFAULT_DETAIL_DATA.postLogoutRedirectUris!]
    } as BIamAuth2RegisteredClientDetailResponseVo
  })

  // 客户端凭证模式：作用域为角色ID，保存角色ID -> 角色名称映射用于展示
  const roleNameMap = ref<Map<string, string>>(new Map())

  // 授权方式相关计算属性
  const isAuthorizationCode = computed(() => state.detailData.authorizationGrantType === 'AUTHORIZATION_CODE')
  const isClientCredentials = computed(() => state.detailData.authorizationGrantType === 'CLIENT_CREDENTIALS')

  const grantTypeLabel = computed(() => {
    return enumStore.getEnumLabel(DICT_IAM_AUTH_GRANT_TYPE, state.detailData.authorizationGrantType)
  })

  const grantTypeTagType = computed(() => (isAuthorizationCode.value ? 'primary' : 'success'))

  const formatTime = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : ''
  }

  const handleDialogClosed = () => {
    state.detailData = {
      ...DEFAULT_DETAIL_DATA,
      scopes: [...DEFAULT_DETAIL_DATA.scopes],
      allowedIps: [...DEFAULT_DETAIL_DATA.allowedIps!],
      redirectUris: [...DEFAULT_DETAIL_DATA.redirectUris!],
      postLogoutRedirectUris: [...DEFAULT_DETAIL_DATA.postLogoutRedirectUris!]
    }
    roleNameMap.value = new Map()
  }

  // 拉取全量角色（用于将客户端凭证模式的 scopes 角色ID映射回角色名称）
  const fetchAllRoles = async (): Promise<BIamRoleSimpleListResponseVo[]> => {
    const all: BIamRoleSimpleListResponseVo[] = []
    const size = 500
    let current = 1
    // 循环拉取直到取满全部记录
    while (true) {
      const res = await BIamRoleApi.pageSimple({ current, size })
      all.push(...res.records)
      if (all.length >= res.total) break
      current++
    }
    return all
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await BIamAuth2RegisteredClientApi.detail({
        id: props.clientId
      })
      state.detailData = {
        ...res,
        scopes: res.scopes || [],
        allowedIps: res.allowedIps || [],
        redirectUris: res.redirectUris || [],
        postLogoutRedirectUris: res.postLogoutRedirectUris || []
      }

      // 客户端凭证模式：将 scopes（角色ID）映射为角色名称；未匹配到的保留原值
      if (res.authorizationGrantType === 'CLIENT_CREDENTIALS') {
        try {
          const allRoles = await fetchAllRoles()
          roleNameMap.value = new Map(allRoles.map(role => [role.id, role.name]))
        } catch (error) {
          console.error('获取角色列表失败', error)
          roleNameMap.value = new Map()
        }
      } else {
        roleNameMap.value = new Map()
      }
    } catch (error) {
      console.error('获取客户端详情失败', error)
    } finally {
      state.loading = false
    }
  }

  watch(
    [() => props.modelValue, () => props.clientId],
    ([newVisible, newClientId]) => {
      if (newVisible && newClientId) {
        fetchData()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .uri-tag-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    .uri-tag {
      width: 100%;
      white-space: normal;
      word-break: break-all;
      height: auto;
      padding: 4px 12px;
    }
  }

  .scope-tag {
    max-width: 220px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>

<style lang="scss">
  /* 详情弹窗：与全项目一致——垂直上下居中（align-center），
     同时限制最大高度，内容过多时在弹窗内部滚动，避免超出视口 */
  .client-detail-overlay .el-overlay-dialog {
    justify-content: center;
    align-items: center;
    overflow: auto;
  }

  .client-detail-overlay .el-dialog {
    /* align-center 会给 el-dialog 加 is-align-center（margin: auto），
       这里仅补充最大高度与内部滚动，不要再写 margin，否则会破坏居中 */
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
  }

  .client-detail-overlay .el-dialog__header,
  .client-detail-overlay .el-dialog__footer {
    flex-shrink: 0;
  }

  .client-detail-overlay .el-dialog__body {
    overflow: auto;
    min-height: 0;
  }
</style>
