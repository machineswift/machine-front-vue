<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑客户端"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="720px"
    top="9vh"
    overlay-class="client-form-overlay"
  >
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      title="出于安全考虑，客户端密钥不会再次展示。留空表示不修改原密钥；如需更换，请输入或点击“重新生成”，保存后请立即复制保存。"
    />

    <el-form :model="state.formData" label-width="120px" :rules="rules" ref="formRef" v-loading="state.loading">
      <el-form-item label="客户端ID">
        <el-input :model-value="state.formData.clientId" disabled />
      </el-form-item>

      <el-form-item label="授权方式">
        <el-input :model-value="grantTypeLabel" disabled>
          <template #append>
            <el-tooltip content="授权方式创建后不可修改" placement="top">
              <el-icon class="grant-type-lock"><Lock /></el-icon>
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="客户端名称" prop="clientName">
        <el-input v-model="state.formData.clientName" placeholder="请输入客户端名称" maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="客户端密钥" prop="clientSecret">
        <div class="secret-input-group">
          <el-input v-model="state.formData.clientSecret" placeholder="留空则不修改原密钥；点击右侧可生成新密钥" clearable maxlength="64">
            <template #append>
              <el-button :icon="RefreshRight" @click="handleGenerateSecret">重新生成</el-button>
            </template>
          </el-input>
        </div>
      </el-form-item>

      <!-- 客户端凭证模式：作用域为开放平台角色ID -->
      <el-form-item v-if="isClientCredentials" label="作用域" prop="scopes">
        <el-select
          v-model="selectedRoleIds"
          multiple
          clearable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择角色作为作用域"
          @remove-tag="removeScopeRole"
          @clear="clearScopeRoles"
          style="width: 100%"
        >
          <el-option v-for="role in state.selectedRoles" :key="role.id" :label="role.name" :value="role.id" />
          <template #prefix>
            <el-button size="small" type="primary" plain @click.stop="showRoleSelectorDialog" style="margin-right: 8px; height: 24px">选择</el-button>
          </template>
        </el-select>
        <div class="scope-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>客户端凭证模式下，作用域为开放平台角色，保存后以角色ID作为授权范围。</span>
        </div>
      </el-form-item>

      <!-- 授权码模式：作用域为 OIDC 标准作用域 -->
      <el-form-item v-if="isAuthorizationCode" label="作用域" prop="scopes">
        <el-checkbox-group v-model="state.formData.scopes" class="scope-checkbox-group">
          <el-checkbox v-for="scope in AUTH_CODE_SCOPE_OPTIONS" :key="scope" :label="scope" :value="scope" :disabled="scope === 'openid'">
            {{ scope }}
          </el-checkbox>
        </el-checkbox-group>
        <div class="scope-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>授权码模式下，openid 为 OIDC 必选作用域，其余按需开放。</span>
        </div>
      </el-form-item>

      <!-- 授权码模式：重定向URI -->
      <template v-if="isAuthorizationCode">
        <el-form-item label="重定向URI" prop="redirectUris">
          <UriListEditor
            v-model="state.formData.redirectUris"
            placeholder="请输入授权成功后的回调地址"
            tip="授权成功后，浏览器将携带授权码重定向到该地址，至少填写一条。"
          />
        </el-form-item>

        <el-form-item label="登出后重定向URI" prop="postLogoutRedirectUris">
          <UriListEditor
            v-model="state.formData.postLogoutRedirectUris"
            placeholder="请输入登出成功后的回调地址"
            tip="用户在 OIDC 登出后，浏览器将重定向到该地址，至少填写一条。"
          />
        </el-form-item>
      </template>

      <el-form-item label="IP白名单" prop="allowedIps">
        <IpWhitelistEditor v-model="state.formData.allowedIps" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:UPDATE']"
      >
        保存
      </el-button>
    </template>
  </el-dialog>

  <!-- 更换密钥成功后的一次性展示 -->
  <BIamAuth2RegisteredClientSecretDialog
    v-model="state.secretVisible"
    :client-id="state.secret.clientId"
    :client-secret="state.secret.clientSecret"
    title="客户端密钥已更新"
  />

  <!-- 角色作为作用域的选择对话框 -->
  <BIamRoleQuickSelectDialog
    v-model="state.roleSelectorVisible"
    :multiple="true"
    :selected-roles="state.selectedRoles"
    :role-type="'OPENAPI'"
    @confirm="handleQueryRoleSelect"
  />
</template>

<script setup lang="ts">
  import { ref, watch, reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { RefreshRight, Lock, InfoFilled } from '@element-plus/icons-vue'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/auth2RegisteredClient/api/BIamAuth2RegisteredClient.api'
  import BIamAuth2RegisteredClientSecretDialog from '@/modules/biam/auth2RegisteredClient/BIamAuth2RegisteredClientSecretDialog.vue'
  import BIamRoleQuickSelectDialog from '@/modules/biam/role/BIamRoleQuickSelectDialog.vue'
  import IpWhitelistEditor from '@/shared/components/IpWhitelistEditor.vue'
  import UriListEditor from '@/shared/components/UriListEditor.vue'
  import { BIamRoleApi } from '@/modules/biam/role/api/BIamRole.api'
  import type { BIamRoleSimpleListResponseVo } from '@/modules/biam/role/type/BIamRole.type'
  import type {
    BIamAuth2RegisteredClientDetailResponseVo,
    BIamAuth2RegisteredClientUpdateRequestVo
  } from '@/modules/biam/auth2RegisteredClient/type/BIamAuth2RegisteredClient.type'
  import { AUTH_CODE_SCOPE_OPTIONS } from '@/modules/biam/auth2RegisteredClient/type/BIamAuth2RegisteredClient.type'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_AUTH_GRANT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { generateClientSecret, STRONG_SECRET_PATTERN } from '@/shared/utils/Secret.util'

  const enumStore = useDictionaryEnumStore()

  const DEFAULT_FORM_DATA = {
    id: '',
    clientId: '',
    authorizationGrantType: 'CLIENT_CREDENTIALS',
    clientName: '',
    clientSecret: '',
    scopes: [] as string[],
    allowedIps: [] as string[],
    redirectUris: [] as string[],
    postLogoutRedirectUris: [] as string[]
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    clientId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const formRef = ref()

  const validateSecret = (_rule: unknown, value: string, callback: (error?: Error) => void): void => {
    // 留空表示不修改原密钥
    if (!value || !value.trim()) {
      callback()
      return
    }
    if (!STRONG_SECRET_PATTERN.test(value)) {
      callback(new Error('密钥长度需大于等于64位，且至少包含4个特殊字符'))
      return
    }
    callback()
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),

    loading: false,
    submitting: false,

    // 密钥仅此一次展示
    secretVisible: false,
    secret: {
      clientId: '',
      clientSecret: ''
    },

    // 角色选择对话框（客户端凭证模式，角色作为作用域）
    roleSelectorVisible: false,
    selectedRoles: [] as BIamRoleSimpleListResponseVo[],
    // 未匹配到角色的历史作用域（如旧的角色名），保存时保留
    legacyScopes: [] as string[],

    formData: {
      ...DEFAULT_FORM_DATA,
      scopes: [...DEFAULT_FORM_DATA.scopes],
      redirectUris: [...DEFAULT_FORM_DATA.redirectUris],
      postLogoutRedirectUris: [...DEFAULT_FORM_DATA.postLogoutRedirectUris]
    }
  })

  // 授权方式相关计算属性（创建后不可修改，编辑时只读展示）
  const isClientCredentials = computed(() => state.formData.authorizationGrantType === 'CLIENT_CREDENTIALS')
  const isAuthorizationCode = computed(() => state.formData.authorizationGrantType === 'AUTHORIZATION_CODE')

  const grantTypeLabel = computed(() => {
    return enumStore.getEnumLabel(DICT_IAM_AUTH_GRANT_TYPE, state.formData.authorizationGrantType)
  })

  // 校验规则（重定向URI相关规则仅在授权码模式下生效）
  const rules = computed<Record<string, unknown[]>>(() => {
    const baseRules: Record<string, unknown[]> = {
      clientName: [
        { required: true, message: '请输入客户端名称', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ],
      clientSecret: [{ validator: validateSecret, trigger: 'blur' }],
      scopes: [
        { required: true, message: '请选择作用域', trigger: 'change' },
        { type: 'array', min: 1, message: '至少选择一个作用域', trigger: 'change' }
      ]
    }

    if (isAuthorizationCode.value) {
      baseRules.redirectUris = [
        { required: true, message: '请至少填写一条重定向URI', trigger: 'change' },
        { type: 'array', min: 1, message: '请至少填写一条重定向URI', trigger: 'change' }
      ]
      baseRules.postLogoutRedirectUris = [
        { required: true, message: '请至少填写一条登出后重定向URI', trigger: 'change' },
        { type: 'array', min: 1, message: '请至少填写一条登出后重定向URI', trigger: 'change' }
      ]
    }
    return baseRules
  })

  // 选中角色 ID（用于作用域多选组件绑定，参考用户管理筛选条件角色）
  const selectedRoleIds = computed({
    get: () => state.selectedRoles.map(role => role.id),
    set: newIds => {
      state.selectedRoles = newIds.map(id => state.selectedRoles.find(role => role.id === id) || ({ id } as BIamRoleSimpleListResponseVo))
    }
  })

  // 打开角色选择对话框
  const showRoleSelectorDialog = (): void => {
    state.roleSelectorVisible = true
  }

  // 角色选择确认，选中的角色作为作用域
  const handleQueryRoleSelect = (roles: BIamRoleSimpleListResponseVo[]): void => {
    state.selectedRoles = roles
    state.roleSelectorVisible = false
  }

  // 移除单个作用域角色
  const removeScopeRole = (roleId: string): void => {
    state.selectedRoles = state.selectedRoles.filter(role => role.id !== roleId)
  }

  // 清空所有作用域角色
  const clearScopeRoles = (): void => {
    state.selectedRoles = []
  }

  // 选中的角色ID + 历史作用域同步到 scopes（客户端凭证模式，作用域存角色ID，与后端约定一致）
  watch(
    () => state.selectedRoles,
    roles => {
      if (isClientCredentials.value) {
        state.formData.scopes = [...roles.map(role => role.id), ...state.legacyScopes]
      }
    },
    { immediate: true }
  )

  // 拉取全量角色（用于将已有 scopes 角色ID映射回角色对象回显）
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

  const handleDialogClosed = () => {
    state.formData = {
      ...DEFAULT_FORM_DATA,
      scopes: [...DEFAULT_FORM_DATA.scopes],
      allowedIps: [...DEFAULT_FORM_DATA.allowedIps],
      redirectUris: [...DEFAULT_FORM_DATA.redirectUris],
      postLogoutRedirectUris: [...DEFAULT_FORM_DATA.postLogoutRedirectUris]
    }
    state.selectedRoles = []
    state.legacyScopes = []
    state.roleSelectorVisible = false
    formRef.value?.resetFields()
  }

  const fetchDetail = async () => {
    try {
      state.loading = true
      const res: BIamAuth2RegisteredClientDetailResponseVo = await BIamAuth2RegisteredClientApi.detail({ id: props.clientId })
      const scopeNames = res.scopes || []
      state.formData = {
        id: res.id,
        clientId: res.clientId,
        authorizationGrantType: res.authorizationGrantType,
        clientName: res.clientName,
        clientSecret: '',
        scopes: scopeNames,
        allowedIps: res.allowedIps || [],
        redirectUris: res.redirectUris || [],
        postLogoutRedirectUris: res.postLogoutRedirectUris || []
      }

      // 客户端凭证模式：将已有 scopes（角色ID）映射回角色对象用于回显；未匹配的历史作用域保留不丢失
      if (isClientCredentials.value) {
        try {
          const allRoles = await fetchAllRoles()
          const roleIdMap = new Map(allRoles.map(role => [role.id, role]))
          state.selectedRoles = scopeNames.filter(id => roleIdMap.has(id)).map(id => roleIdMap.get(id)!)
          state.legacyScopes = scopeNames.filter(id => !roleIdMap.has(id))
        } catch (error) {
          console.error('获取角色列表失败', error)
          state.selectedRoles = []
          state.legacyScopes = scopeNames
        }
      } else {
        state.selectedRoles = []
        state.legacyScopes = []
      }
    } catch (error) {
      console.error('获取客户端详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()

      // 去除首尾空白；空白视为不修改密钥（与后端 StrUtil.isNotBlank 保持一致）
      const newSecret = state.formData.clientSecret.trim()
      state.submitting = true

      const params: BIamAuth2RegisteredClientUpdateRequestVo = {
        id: state.formData.id,
        clientName: state.formData.clientName,
        clientSecret: newSecret || undefined,
        scopes: state.formData.scopes,
        allowedIps: state.formData.allowedIps || []
      }
      if (isAuthorizationCode.value) {
        // 授权码模式必填重定向URI，去除空串后提交
        params.redirectUris = state.formData.redirectUris.filter(uri => uri.trim())
        params.postLogoutRedirectUris = state.formData.postLogoutRedirectUris.filter(uri => uri.trim())
      }

      await BIamAuth2RegisteredClientApi.update(params)

      // 先取出数据再关闭表单，避免被 handleDialogClosed 清空
      const targetClientId = state.formData.clientId
      const targetSecret = newSecret
      state.dialogVisible = false
      emit('success')

      if (targetSecret) {
        // 更换了密钥：一次性展示新密钥，提示用户复制保存
        openSecretDialog(targetClientId, targetSecret)
      } else {
        ElMessage.success('修改成功')
      }
    } catch (error) {
      console.error('修改客户端失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleGenerateSecret = (): void => {
    state.formData.clientSecret = generateClientSecret()
    formRef.value?.clearValidate('clientSecret')
  }

  const openSecretDialog = (clientId: string, clientSecret: string): void => {
    state.secret.clientId = clientId
    state.secret.clientSecret = clientSecret
    state.secretVisible = true
  }

  // 密钥弹窗关闭后清空凭据，避免残留敏感信息
  watch(
    () => state.secretVisible,
    visible => {
      if (!visible) {
        state.secret = { clientId: '', clientSecret: '' }
      }
    }
  )

  watch(
    [() => props.modelValue, () => props.clientId],
    ([newVisible, newClientId]) => {
      if (newVisible && newClientId) {
        fetchDetail()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .secret-input-group {
    width: 100%;
  }

  .scope-checkbox-group {
    width: 100%;
  }

  .scope-tip {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    width: 100%;
  }

  .grant-type-lock {
    cursor: help;
    color: var(--el-text-color-secondary);
  }
</style>

<style lang="scss">
  /* 客户端编辑弹窗：限制最大高度，数据多时表单内部滚动，自动适应窗口高度 */
  .client-form-overlay .el-dialog {
    max-height: calc(100vh - 16vh);
    display: flex;
    flex-direction: column;
  }

  .client-form-overlay .el-dialog__header,
  .client-form-overlay .el-dialog__footer {
    flex-shrink: 0;
  }

  .client-form-overlay .el-dialog__body {
    overflow: auto;
    min-height: 0;
  }
</style>
