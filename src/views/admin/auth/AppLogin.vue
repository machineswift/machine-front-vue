<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :width="420"
    :close-on-click-modal="false"
    :show-close="false"
    class="login-dialog"
    align-center
    top="8vh"
  >
    <button class="dialog-close" @click="$emit('update:visible', false)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>

    <div class="dialog-inner">
      <div class="brand">
        <div class="brand-icon">M</div>
        <div class="brand-text">MACHINE</div>
        <p class="brand-sub">企业智能管理平台</p>
      </div>

      <el-form :model="loginFormModel" :rules="loginFormRules" ref="loginFormRef" class="login-form" @keyup.enter="login">
        <el-form-item prop="username">
          <el-input v-model="loginFormModel.username" placeholder="用户名" size="large" clearable>
            <template #prefix>
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginFormModel.password" type="password" placeholder="密码" show-password size="large" clearable>
            <template #prefix>
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input v-model="loginFormModel.captcha" placeholder="验证码" size="large" maxlength="4">
              <template #prefix>
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </template>
            </el-input>
            <img :src="captchaImg" alt="验证码" @click="getPicCaptcha" class="captcha-img" title="点击刷新" />
          </div>
        </el-form-item>

        <el-form-item>
          <button class="login-btn" type="button" :disabled="loading" @click="login">
            <span v-if="!loading">登 录</span>
            <span v-else>
              <span class="btn-spinner"></span>
              登录中...
            </span>
          </button>
        </el-form-item>
      </el-form>

      <div class="oauth-section">
        <div class="oauth-line"><span>其他登录方式</span></div>
        <button class="oauth-btn" @click="handleGiteeLogin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.376.203 2.394.1 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          Gitee 账号登录
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { reactive, ref, watch } from 'vue'
  import { useIamUserStore } from '@/shared/stores/IamUser.store'
  import type { IamAuthUsernameLoginRequestVo } from '@/modules/iam/auth/type/IamAuth.type'
  import { IamAuthApi } from '@/modules/iam/auth/api/IamAuth.api'
  import { IamAuth2Api } from '@/modules/iam/auth/api/IamAuth2.api'

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{ 'update:visible': [v: boolean]; 'login-success': [] }>()

  const userStore = useIamUserStore()
  const captchaImg = ref('')
  const loginFormRef = ref()
  const loading = ref(false)

  const loginFormModel = reactive<IamAuthUsernameLoginRequestVo>({ username: '', password: '', captcha: '', userKey: '' })

  const loginFormRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 4, message: '4位验证码', trigger: 'blur' }
    ]
  })

  const getPicCaptcha = async () => {
    try {
      const data = await IamAuthApi.getPictureCaptcha()
      if (data.captchaImg) captchaImg.value = data.captchaImg
      if (data.userKey) loginFormModel.userKey = data.userKey
    } catch {
      /* 降级处理 */
    }
  }

  const login = async () => {
    try {
      await loginFormRef.value.validate()
      loading.value = true
      const authInfo = await IamAuthApi.loginByUsername(loginFormModel)
      if (!(await userStore.login(authInfo))) {
        ElMessage.error('用户菜单权限加载失败，请检查账号权限配置')
        return
      }
      emit('login-success')
      emit('update:visible', false)
    } catch (error) {
      console.error('登录失败', error)
      await getPicCaptcha()
    } finally {
      loading.value = false
    }
  }

  const handleGiteeLogin = () => {
    IamAuth2Api.gitee()
    ElMessage.success('正在跳转 Gitee 登录...')
  }

  watch(
    () => props.visible,
    v => {
      if (v) getPicCaptcha()
    }
  )
</script>

<style lang="scss">
  .login-dialog {
    .el-overlay {
      background: rgba(0, 0, 0, 0.5) !important;
      backdrop-filter: blur(4px);
    }

    .el-dialog {
      background: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12) !important;
      padding: 0 !important;
      overflow: hidden;
      width: 400px;
      animation: loginDialogEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .el-dialog__header {
      display: none !important;
    }

    .el-dialog__body {
      padding: 0 !important;
      position: relative;
    }
  }

  @keyframes loginDialogEnter {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(16px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>

<style scoped lang="scss">
  $bg-input: #f5f5f7;
  $border-subtle: rgba(0, 0, 0, 0.08);
  $border-hover: rgba(0, 0, 0, 0.15);
  $text-primary: #1d1d1f;
  $text-secondary: #6e6e73;
  $text-muted: #aeaeb2;
  $accent: #667eea;
  $accent-gradient: linear-gradient(135deg, #667eea, #764ba2);

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .dialog-close {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 10;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: $text-muted;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      color: $text-primary;
    }
  }

  .dialog-inner {
    padding: 32px 28px 28px;
  }

  .brand {
    text-align: center;
    margin-bottom: 28px;

    .brand-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      background: $accent-gradient;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      font-weight: 800;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 800;
      color: $text-primary;
      letter-spacing: 4px;
    }

    .brand-sub {
      font-size: 12px;
      color: $text-secondary;
      margin: 4px 0 0;
      letter-spacing: 1px;
    }
  }

  .login-form {
    :deep(.el-form-item) {
      margin-bottom: 14px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.el-input__wrapper) {
      background: $bg-input;
      border: 1px solid $border-subtle;
      border-radius: 10px;
      box-shadow: none !important;
      padding: 0 10px 0 0;
      transition:
        border-color 0.25s,
        background 0.25s;

      &:hover {
        border-color: $border-hover;
        background: #f0f0f2;
      }
      &.is-focus {
        border-color: $accent;
        background: #fff;
      }
    }

    :deep(.el-input__prefix) {
      margin-right: 6px;
      .input-icon {
        color: $text-muted;
        transition: color 0.25s;
      }
    }

    :deep(.el-input__wrapper.is-focus) {
      .input-icon {
        color: $accent;
      }
    }

    :deep(.el-input__inner) {
      color: $text-primary;
      font-size: 14px;
      height: 42px;
      &::placeholder {
        color: $text-muted;
      }
    }

    .captcha-row {
      display: flex;
      gap: 10px;

      :deep(.el-input) {
        flex: 1;
      }

      .captcha-img {
        width: 96px;
        height: 42px;
        border-radius: 10px;
        cursor: pointer;
        border: 1px solid $border-subtle;
        object-fit: cover;
        transition: border-color 0.2s;
        flex-shrink: 0;

        &:hover {
          border-color: $border-hover;
        }
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 6px;
    border-radius: 10px;
    background: $accent-gradient;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition:
      opacity 0.3s,
      transform 0.15s;
    overflow: hidden;

    &:hover {
      opacity: 0.85;
    }
    &:active {
      transform: scale(0.98);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  }

  .oauth-section {
    margin-top: 20px;

    .oauth-line {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: $border-subtle;
      }
      span {
        padding: 0 14px;
        font-size: 11px;
        color: $text-muted;
        white-space: nowrap;
      }
    }

    .oauth-btn {
      width: 100%;
      height: 42px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid $border-subtle;
      color: $text-secondary;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition:
        border-color 0.25s,
        color 0.25s,
        background 0.25s;

      &:hover {
        border-color: $accent;
        color: $accent;
        background: rgba(102, 126, 234, 0.04);
      }
    }
  }
</style>
