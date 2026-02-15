<template>
  <div class="callback-container">
    <el-row justify="center" align="middle" class="callback-row">
      <el-col :span="24" class="callback-content">
        <div class="callback-card">
          <div v-if="loading" class="loading-spinner">
            <el-icon class="is-loading" size="50" color="#409EFF">
              <Loading />
            </el-icon>
            <p class="loading-text">正在处理登录...</p>
          </div>
          <div v-else-if="error" class="error-message">
            <el-icon size="50" color="#F56C6C">
              <CircleCloseFilled />
            </el-icon>
            <p class="error-text">{{ error }}</p>
            <el-button type="primary" @click="redirectToLogin">返回登录页</el-button>
          </div>
          <div v-else class="success-message">
            <el-icon size="50" color="#67C23A">
              <CircleCheckFilled />
            </el-icon>
            <p class="success-text">登录成功，正在跳转...</p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { CircleCheckFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'
  import { useIamUserStore } from '@/modules/common/stores/IamUser.store'
  import type { IamAuthLoginResponseVo } from '@/modules/iam/auth/type/IamAuth.type'

  const route = useRoute()
  const router = useRouter()
  const userStore = useIamUserStore()

  const loading = ref(true)
  const error = ref('')
  const autoRedirectTimer = ref<number>()

  // 验证必要的查询参数
  const validateQueryParams = (): IamAuthLoginResponseVo => {
    if (!route.query.access_token) {
      throw new Error(route.query.message?.toString() || '缺少访问令牌')
    }

    return {
      accessToken: route.query.access_token as string,
      expiresIn: parseInt(route.query.expires_in as string),
      refreshToken: (route.query.refresh_token as string) || '',
      tokenType: (route.query.token_type as string) || 'Bearer'
    }
  }

  // 处理登录成功后的跳转
  const handleSuccessfulLogin = async () => {
    const redirectPath = route.query.redirect ? decodeURIComponent(route.query.redirect as string) : '/layout'

    try {
      await router.replace(redirectPath)
    } catch (err) {
      console.error('路由跳转失败:', err)
      window.location.href = redirectPath
    }
  }

  // 跳转到登录页
  const redirectToLogin = () => {
    clearTimeout(autoRedirectTimer.value)
    router.replace('/login').catch(() => {
      window.location.href = '/login'
    })
  }

  // 处理OAuth回调
  const processCallback = async () => {
    try {
      const authInfo = validateQueryParams()
      const success = await userStore.login(authInfo)

      if (!success) {
        throw new Error('登录状态验证失败')
      }

      // login 方法内部已经调用了 setAsyncRoute，无需重复调用
      await handleSuccessfulLogin()
    } catch (err) {
      console.error('第三方登录回调处理失败:', err)
      error.value = err instanceof Error ? err.message : '第三方登录处理失败'
      autoRedirectTimer.value = window.setTimeout(redirectToLogin, 5000)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    processCallback()
  })

  // 清除定时器
  onBeforeUnmount(() => {
    clearTimeout(autoRedirectTimer.value)
  })
</script>

<style scoped lang="scss">
  .callback-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;

    .callback-row {
      width: 100%;
      height: 100%;

      .callback-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    }

    .callback-card {
      width: 400px;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #fff;
      text-align: center;

      .loading-spinner,
      .error-message,
      .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .loading-text,
      .error-text,
      .success-text {
        font-size: 16px;
        color: #606266;
        margin: 0;
      }

      .error-text {
        color: #f56c6c;
      }

      .success-text {
        color: #67c23a;
      }
    }
  }

  @media (max-width: 768px) {
    .callback-container {
      .callback-card {
        width: 90%;
        padding: 30px 20px;
      }
    }
  }
</style>
