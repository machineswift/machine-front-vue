<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加客户端"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="720px"
    top="9vh"
    overlay-class="client-form-overlay"
  >
    <el-form :model="state.formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="授权方式" prop="authorizationGrantType">
        <el-select v-model="state.formData.authorizationGrantType" placeholder="请选择授权方式" style="width: 100%" @change="handleGrantTypeChange">
          <el-option v-for="option in grantTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="客户端名称" prop="clientName">
        <el-input v-model="state.formData.clientName" placeholder="请输入客户端名称" maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="客户端密钥" prop="clientSecret">
        <div class="secret-input-group">
          <el-input v-model="state.formData.clientSecret" placeholder="已自动生成，可手动修改或重新生成" clearable maxlength="64">
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
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.submitting"
        v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:CREATE']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>

  <!-- 创建成功后的密钥一次性展示 -->
  <BIamAuth2RegisteredClientSecretDialog
    v-model="state.secretVisible"
    :client-id="state.secret.clientId"
    :client-secret="state.secret.clientSecret"
    title="客户端创建成功"
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
  import { ref, computed, reactive, watch, onMounted } from 'vue'
  import { RefreshRight, InfoFilled } from '@element-plus/icons-vue'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_AUTH_GRANT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/auth2RegisteredClient/api/BIamAuth2RegisteredClient.api'
  import BIamAuth2RegisteredClientSecretDialog from '@/modules/biam/auth2RegisteredClient/BIamAuth2RegisteredClientSecretDialog.vue'
  import BIamRoleQuickSelectDialog from '@/modules/biam/role/BIamRoleQuickSelectDialog.vue'
  import IpWhitelistEditor from '@/shared/components/IpWhitelistEditor.vue'
  import UriListEditor from '@/shared/components/UriListEditor.vue'
  import type { BIamRoleSimpleListResponseVo } from '@/modules/biam/role/type/BIamRole.type'
  import type { IdResponse } from '@/shared/types/Common.type'
  import type { BIamAuth2RegisteredClientCreateRequestVo } from '@/modules/biam/auth2RegisteredClient/type/BIamAuth2RegisteredClient.type'
  import { AUTH_CODE_SCOPE_OPTIONS, AUTH_CODE_DEFAULT_SCOPES } from '@/modules/biam/auth2RegisteredClient/type/BIamAuth2RegisteredClient.type'
  import { generateClientSecret, STRONG_SECRET_PATTERN } from '@/shared/utils/Secret.util'

  const { options: grantTypeOptions, load: loadGrantTypeOptions } = useEnumOptions(DICT_IAM_AUTH_GRANT_TYPE)

  const DEFAULT_FORM_DATA = {
    authorizationGrantType: 'CLIENT_CREDENTIALS',
    clientName: '',
    clientSecret: '',
    scopes: [] as string[],
    allowedIps: [] as string[],
    redirectUris: [] as string[],
    postLogoutRedirectUris: [] as string[]
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const formRef = ref()

  const validateSecret = (_rule: unknown, value: string, callback: (error?: Error) => void): void => {
    if (!value) {
      callback(new Error('请输入客户端密钥'))
      return
    }
    if (!STRONG_SECRET_PATTERN.test(value)) {
      callback(new Error('密钥长度需大于等于64位，且至少包含4个特殊字符'))
      return
    }
    callback()
  }

  const state = reactive({
    submitting: false,

    // 角色选择对话框（客户端凭证模式，角色作为作用域）
    roleSelectorVisible: false,
    selectedRoles: [] as BIamRoleSimpleListResponseVo[],

    // 密钥仅此一次展示
    secretVisible: false,
    secret: {
      clientId: '',
      clientSecret: ''
    },

    formData: {
      ...DEFAULT_FORM_DATA,
      scopes: [...DEFAULT_FORM_DATA.scopes],
      redirectUris: [...DEFAULT_FORM_DATA.redirectUris],
      postLogoutRedirectUris: [...DEFAULT_FORM_DATA.postLogoutRedirectUris]
    }
  })

  // 授权方式相关计算属性
  const isClientCredentials = computed(() => state.formData.authorizationGrantType === 'CLIENT_CREDENTIALS')
  const isAuthorizationCode = computed(() => state.formData.authorizationGrantType === 'AUTHORIZATION_CODE')

  // 校验规则（重定向URI相关规则仅在授权码模式下生效）
  const rules = computed<Record<string, unknown[]>>(() => {
    const baseRules: Record<string, unknown[]> = {
      authorizationGrantType: [{ required: true, message: '请选择授权方式', trigger: 'change' }],
      clientName: [
        { required: true, message: '请输入客户端名称', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ],
      clientSecret: [
        { required: true, message: '请输入客户端密钥', trigger: 'blur' },
        { validator: validateSecret, trigger: 'blur' }
      ],
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

  // 选中的角色ID同步到 scopes（客户端凭证模式，作用域存角色ID，与后端约定一致）
  watch(
    () => state.selectedRoles,
    roles => {
      if (isClientCredentials.value) {
        state.formData.scopes = roles.map(role => role.id)
      }
    },
    { immediate: true }
  )

  const handleGenerateSecret = (): void => {
    state.formData.clientSecret = generateClientSecret()
    formRef.value?.clearValidate('clientSecret')
  }

  // 切换授权方式：重置对应模式的作用域与URI，避免残留上一模式的数据
  const handleGrantTypeChange = (value: string): void => {
    state.formData.scopes = []
    state.formData.redirectUris = []
    state.formData.postLogoutRedirectUris = []
    if (value === 'AUTHORIZATION_CODE') {
      state.formData.scopes = [...AUTH_CODE_DEFAULT_SCOPES]
    }
    state.selectedRoles = []
    formRef.value?.clearValidate()
  }

  // 打开弹窗时自动生成符合规则的客户端密钥，减少人工输入
  watch(
    () => props.modelValue,
    visible => {
      if (visible) {
        handleGenerateSecret()
      }
    }
  )

  // 密钥弹窗关闭后清空凭据，避免残留敏感信息
  watch(
    () => state.secretVisible,
    visible => {
      if (!visible) {
        state.secret = { clientId: '', clientSecret: '' }
      }
    }
  )

  const fetchClientId = async (id: string): Promise<string> => {
    try {
      const detail = await BIamAuth2RegisteredClientApi.detail({ id })
      return detail.clientId
    } catch (error) {
      console.error('获取客户端ID失败', error)
      return ''
    }
  }

  const openSecretDialog = (clientId: string, clientSecret: string): void => {
    state.secret.clientId = clientId
    state.secret.clientSecret = clientSecret
    state.secretVisible = true
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      const params: BIamAuth2RegisteredClientCreateRequestVo = {
        authorizationGrantType: state.formData.authorizationGrantType,
        clientName: state.formData.clientName,
        clientSecret: state.formData.clientSecret,
        scopes: state.formData.scopes,
        allowedIps: state.formData.allowedIps || []
      }
      if (isAuthorizationCode.value) {
        // 授权码模式必填重定向URI，去除空串后提交
        params.redirectUris = state.formData.redirectUris.filter(uri => uri.trim())
        params.postLogoutRedirectUris = state.formData.postLogoutRedirectUris.filter(uri => uri.trim())
      }

      const res: IdResponse = await BIamAuth2RegisteredClientApi.create(params)

      // 先取出密钥再关闭表单，避免被 resetForm 清空
      const secret = state.formData.clientSecret
      dialogVisible.value = false
      emit('success')

      const clientId = await fetchClientId(res.id)
      openSecretDialog(clientId, secret)
    } catch (error) {
      console.error('添加客户端失败', error)
    } finally {
      state.submitting = false
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    state.formData = {
      ...DEFAULT_FORM_DATA,
      scopes: [...DEFAULT_FORM_DATA.scopes],
      allowedIps: [...DEFAULT_FORM_DATA.allowedIps],
      redirectUris: [...DEFAULT_FORM_DATA.redirectUris],
      postLogoutRedirectUris: [...DEFAULT_FORM_DATA.postLogoutRedirectUris]
    }
    state.selectedRoles = []
    state.roleSelectorVisible = false
  }

  const handleDialogClosed = () => {
    resetForm()
    state.submitting = false
  }

  onMounted(async () => {
    await loadGrantTypeOptions()
  })
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
</style>

<style lang="scss">
  /* 客户端添加弹窗：限制最大高度，数据多时表单内部滚动，自动适应窗口高度 */
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
