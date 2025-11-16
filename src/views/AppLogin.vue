<template>
  <div class="login-container">
    <el-row justify="center" align="middle" class="login-row">
      <el-col :span="12" :xs="0" class="login-bg"></el-col>
      <el-col :span="12" :xs="24" class="login-form-col">
        <el-form :model="loginFormModel" :rules="loginFormRules" ref="loginFormRef" class="login-form" label-width="80px">
          <h1 class="login-title">欢迎登录</h1>
          <el-form-item label="用户名" prop="username">
            <el-input :prefix-icon="User" type="text" placeholder="请输入账号" v-model="loginFormModel.username" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="loginFormModel.password" show-password size="large" />
          </el-form-item>
          <el-form-item label="验证码" prop="captcha">
            <div class="captcha-container">
              <el-input type="text" placeholder="请输入验证码" v-model="loginFormModel.captcha" size="large" />
              <img :src="captchaImg" alt="验证码" @click="getPicCaptcha" class="captcha-img" />
            </div>
          </el-form-item>

          <el-form-item v-if="false" label="用户key" prop="userKey">
            <el-input type="text" v-model="loginFormModel.userKey" size="large" />
          </el-form-item>
          <el-form-item>
            <el-button class="login-button" type="primary" @click="login" size="large">登录</el-button>
          </el-form-item>

          <!-- 新增第三方登录区域 -->
          <div class="third-party-login">
            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">第三方登录</span>
              <span class="divider-line"></span>
            </div>
            <div class="oauth-buttons">
              <el-tooltip content="Gitee登录" placement="top">
                <el-button class="oauth-button" circle @click="handleGiteeLogin">
                  <img src="https://gitee.com/static/images/logo-black.svg" alt="Gitee" class="oauth-icon" />
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import router from '@/router'
  import { ElMessage } from 'element-plus'
  import { reactive, onMounted, ref } from 'vue'
  import { User, Lock } from '@element-plus/icons-vue'
  import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'
  import type { IamAuthCaptchaResponseVo, IamAuthLoginResponseVo, IamAuthUsernameLoginRequestVo } from '@/modules/iam/auth/type/IamAuth.type'
  import { IamAuthApi } from '@/modules/iam/auth/api/IamAuth.api'
  import { IamAuth2Api } from '@/modules/iam/auth/api/IamAuth2.api'

  const userStore = useIamUserStore()
  const captchaImg = ref('')
  const loginFormRef = ref()
  const loading = ref(false)

  const loginFormModel = reactive<IamAuthUsernameLoginRequestVo>({
    username: '',
    password: '',
    captcha: '',
    userKey: ''
  })

  const loginFormRules = reactive({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }
    ],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 4, message: '验证码长度为4位', trigger: 'blur' }
    ]
  })

  const getPicCaptcha = async () => {
    const data: IamAuthCaptchaResponseVo = await IamAuthApi.getPictureCaptcha()
    if (data.captchaImg) {
      captchaImg.value = data.captchaImg
    }
    if (data.userKey) {
      loginFormModel.userKey = data.userKey
    }
  }

  const login = async () => {
    try {
      await loginFormRef.value.validate()
      loading.value = true
      const authInfo: IamAuthLoginResponseVo = await IamAuthApi.loginByUsername(loginFormModel)
      const success = await userStore.login(authInfo)
      // login 方法内部已经调用了 setAsyncRoute，无需重复调用
      if (success) {
        await router.push({
          path: '/layout',
          query: { redirect: router.currentRoute.value.query.redirect as string }
        })
      }
    } catch (error) {
      console.error('登录失败', error)
      await getPicCaptcha()
    } finally {
      loading.value = false
    }
  }

  // 新增Gitee登录处理函数
  const handleGiteeLogin = async () => {
    try {
      loading.value = true
      IamAuth2Api.gitee()
      ElMessage.success('正在跳转Gitee登录...')
    } catch (error) {
      console.error('Gitee登录失败', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    getPicCaptcha()
  })
</script>

<style scoped lang="scss">
  .login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-row {
      width: 100%;
      height: 100%;

      .login-bg {
        height: 100vh;
      }

      .login-form-col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    }

    .login-form {
      width: 380px;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .login-title {
        color: #303133;
        font-size: 24px;
        margin-bottom: 30px;
        text-align: center;
        font-weight: 500;
      }

      .captcha-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .captcha-img {
          width: 80px;
          height: 40px;
          cursor: pointer;
          border-radius: 4px;
          border: 1px solid;
        }
      }

      .login-button {
        width: 100%;
        margin-top: 10px;
        font-size: 16px;
        letter-spacing: 2px;
      }

      /* 新增第三方登录样式 */
      .third-party-login {
        margin-top: 20px;

        .divider {
          display: flex;
          align-items: center;
          margin: 20px 0;

          .divider-line {
            flex: 1;
            height: 1px;
            background-color: #dcdfe6;
          }

          .divider-text {
            padding: 0 10px;
            color: #909399;
            font-size: 12px;
          }
        }

        .oauth-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;

          .oauth-button {
            width: 40px;
            height: 40px;
            padding: 0;

            .oauth-icon {
              width: 20px;
              height: 20px;
            }
          }
        }
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
      }
    }
  }

  @media (max-width: 768px) {
    .login-container {
      .login-row {
        .login-bg {
          display: none;
        }

        .login-form-col {
          padding: 0 20px;
        }
      }

      .login-form {
        width: 380px;
        padding: 30px 20px;
      }
    }
  }
</style>
