<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="客户端详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="720px"
    overlay-class="client-detail-overlay"
  >
    <el-form :model="state.detailData" label-width="120px" v-loading="state.loading">
      <el-form-item label="客户端ID">
        <el-input :model-value="state.detailData.clientId" disabled />
      </el-form-item>

      <el-form-item label="授权方式">
        <el-tag :type="grantTypeTagType" effect="plain">{{ grantTypeLabel }}</el-tag>
      </el-form-item>

      <el-form-item label="客户端名称">
        <el-input :model-value="state.detailData.clientName" disabled />
      </el-form-item>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-form-item label="作用域">
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
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
          <span v-if="!state.detailData.scopes?.length" class="empty-text">无</span>
        </div>
      </el-form-item>

      <template v-if="isAuthorizationCode">
        <el-form-item label="重定向URI">
          <div class="uri-tag-list">
            <el-tag v-for="uri in state.detailData.redirectUris" :key="uri" type="primary" effect="plain" class="uri-tag">
              {{ uri }}
            </el-tag>
            <span v-if="!state.detailData.redirectUris?.length" class="empty-text">无</span>
          </div>
        </el-form-item>

        <el-form-item label="登出后重定向URI">
          <div class="uri-tag-list">
            <el-tag v-for="uri in state.detailData.postLogoutRedirectUris" :key="uri" type="warning" effect="plain" class="uri-tag">
              {{ uri }}
            </el-tag>
            <span v-if="!state.detailData.postLogoutRedirectUris?.length" class="empty-text">无</span>
          </div>
        </el-form-item>
      </template>

      <el-form-item label="IP白名单">
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
          <el-tag v-for="ip in state.detailData.allowedIps" :key="ip" type="info" effect="plain" round>
            {{ ip }}
          </el-tag>
          <span v-if="!state.detailData.allowedIps?.length" class="empty-text">不限制（允许所有来源 IP）</span>
        </div>
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, watch, reactive, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_AUTH_GRANT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/auth2RegisteredClient/api/BIamAuth2RegisteredClient.api'
  import { BIamRoleApi } from '@/modules/biam/role/api/BIamRole.api'
  import type { BIamRoleSimpleListResponseVo } from '@/modules/biam/role/type/BIamRole.type'
  import type { BIamAuth2RegisteredClientDetailResponseVo } from '@/modules/biam/auth2RegisteredClient/type/BIamAuth2RegisteredClient.type'

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

  // 根据弹窗实际高度自动计算顶部偏移：数据越多弹窗越高，顶部留白自动缩小，
  // 始终完整可见且位置协调（矮弹窗略高于居中，高弹窗贴近顶部）
  const setAdaptiveDialogTop = (): void => {
    const dialogEl = document.querySelector<HTMLElement>('.client-detail-overlay .el-dialog')
    if (!dialogEl) return
    const freeSpace = window.innerHeight - dialogEl.offsetHeight
    // 顶部留白取剩余空间的 35%，并保证上下均留有可读边距
    const topOffset = Math.max(24, Math.min(freeSpace * 0.35, freeSpace - 16))
    dialogEl.style.setProperty('--dialog-top-offset', `${topOffset}px`)
  }

  let dialogResizeObserver: ResizeObserver | null = null

  // 弹窗打开时测量并监听高度变化（如详情数据加载后变高），关闭时清理
  watch(
    () => props.modelValue,
    visible => {
      if (visible) {
        nextTick(() => {
          const dialogEl = document.querySelector<HTMLElement>('.client-detail-overlay .el-dialog')
          if (!dialogEl) return
          setAdaptiveDialogTop()
          dialogResizeObserver?.disconnect()
          dialogResizeObserver = new ResizeObserver(() => setAdaptiveDialogTop())
          dialogResizeObserver.observe(dialogEl)
        })
      } else {
        dialogResizeObserver?.disconnect()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    window.addEventListener('resize', setAdaptiveDialogTop)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', setAdaptiveDialogTop)
    dialogResizeObserver?.disconnect()
  })
</script>

<style scoped lang="scss">
  .empty-text {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
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
  /* 详情弹窗：顶部偏移由 JS 根据弹窗实际高度动态计算（--dialog-top-offset），
     数据越多弹窗越高，顶部留白自动缩小，始终完整可见且位置协调；
     同时限制最大高度，内容过多时在弹窗内部滚动，避免超出视口 */
  .client-detail-overlay .el-overlay-dialog {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
  }

  .client-detail-overlay .el-dialog {
    /* 顶部偏移默认 6vh 兜底，实际由 JS 动态覆盖 */
    margin: var(--dialog-top-offset, 6vh) auto 0 !important;
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
