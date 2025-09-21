import { IAM_API_BASE_URL } from '@/modules/common/constant/Common.constant'

// 获取基础URL的公共函数
const getBaseUrl = (): string => {
  switch (import.meta.env.MODE) {
    case 'development':
      return import.meta.env.VITE_SERVER_DEV + import.meta.env.VITE_API_BASE_URL
    case 'test':
      return import.meta.env.VITE_SERVER_TEST + import.meta.env.VITE_API_BASE_URL
    case 'production':
      return import.meta.env.VITE_SERVER_PROD + import.meta.env.VITE_API_BASE_URL
    default:
      throw new Error(`不支持的环境模式: ${import.meta.env.MODE}，请检查环境配置。`)
  }
}

const gitee = (): void => {
  window.location.href = getBaseUrl() + IAM_API_BASE_URL + 'iam/auth2/render/gitee'
}

const feiShu = (): void => {
  window.location.href = getBaseUrl() + IAM_API_BASE_URL + 'iam/auth2/render/fei_shu'
}

export const IamAuth2Api = {
  gitee,
  feiShu
}
