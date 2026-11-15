import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useIamUserStore } from '@/shared/stores/IamUser.store'
import { handleHttpError } from '@/shared/api/http-error'

export interface BaseResponse<T = unknown> {
  code: string
  message: string
  timestamp: number
  traceId: string
  data: T
  path?: string
}

export interface CustomRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  retry?: number
  retryDelay?: number
  requestId?: string
  skipAuth?: boolean
  _retry?: boolean
}

type RequestParams = object | URLSearchParams
type RequestData = object | FormData

export type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/**
 * 由应用装配层（main.ts）注入登录跳转。
 *
 * 请求层不直接 import vue-router：拦截器运行在组件 setup 之外，
 * useRouter() 依赖 inject，取到的是 undefined（401 场景下恰好会抛错）。
 */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler
}

const handleUnauthorized = () => {
  if (unauthorizedHandler) {
    unauthorizedHandler()
    return
  }
  // 兜底：未注入时直接改 hash，避免请求层静默失败
  window.location.hash = '#/admin/login'
}

export const getBaseUrl = (): string => {
  const serverHost = import.meta.env.MODE === 'development' ? import.meta.env.VITE_SERVER_DEV : import.meta.env.VITE_SERVER_PROD
  return serverHost + import.meta.env.VITE_API_BASE_URL
}

class RequestUtil {
  private instance: AxiosInstance
  private cancelTokenMap = new Map<string, AbortController>()
  private isRefreshing = false
  private requestsQueue: Array<{ callback: (token: string) => void; reject: (reason: unknown) => void }> = []

  constructor(options: CustomRequestConfig = {}) {
    this.instance = axios.create({
      baseURL: getBaseUrl(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      ...options
    })

    this.setupInterceptors()
  }

  private async setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomRequestConfig

        // 如果有请求ID，设置取消令牌
        if (customConfig.requestId) {
          const controller = new AbortController()
          this.cancelTokenMap.set(customConfig.requestId, controller)
          customConfig.signal = controller.signal
        }

        // 跳过认证的请求直接返回
        if (customConfig.skipAuth) {
          return config
        }

        // 获取有效token
        const userStore = useIamUserStore()
        const token = await userStore.getValidToken()

        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      ((response: AxiosResponse<BaseResponse>) => {
        const res = response.data
        return res.data
      }) as Parameters<typeof this.instance.interceptors.response.use>[0],
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomRequestConfig

        // 跳过认证的请求或非401错误直接处理
        if (originalRequest?.skipAuth || error.response?.status !== 401) {
          handleHttpError(error)
          return Promise.reject(error)
        }

        // 已经重试过仍然失败，直接跳转登录
        if (originalRequest._retry) {
          const userStore = useIamUserStore()
          userStore.clearAuthInfo()
          ElMessage.error('登录状态已过期，请重新登录')

          handleUnauthorized()
          return Promise.reject(error)
        }

        // 401错误处理
        if (!this.isRefreshing) {
          this.isRefreshing = true
          const userStore = useIamUserStore()

          try {
            // 尝试刷新token
            const newToken = await userStore.refreshToken()

            // 刷新成功后重试原始请求
            if (originalRequest) {
              originalRequest._retry = true
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${newToken}`

              // 执行队列中的请求
              this.requestsQueue.forEach(item => item.callback(newToken))
              this.requestsQueue = []

              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            // 刷新失败，拒绝队列中所有等待的请求
            const queue = this.requestsQueue.slice()
            this.requestsQueue = []
            queue.forEach(item => item.reject(refreshError))

            // 清除认证信息并跳转登录
            console.error('Token刷新失败:', refreshError)
            userStore.clearAuthInfo()
            ElMessage.error('登录状态已过期，请重新登录')

            handleUnauthorized()

            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // 如果正在刷新token，将请求加入队列
        return new Promise((resolve, reject) => {
          this.requestsQueue.push({
            callback: (token: string) => {
              if (originalRequest) {
                originalRequest._retry = true
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${token}`
                this.instance(originalRequest).then(resolve).catch(reject)
              }
            },
            reject
          })
        })
      }
    )
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true
    const status = error.response.status
    return [408, 500, 502, 503, 504].includes(status)
  }

  private async requestWithRetry<T = unknown>(config: CustomRequestConfig): Promise<T> {
    const { retry = 0, retryDelay = 1000 } = config
    let retryCount = 0

    const attempt = async (): Promise<T> => {
      try {
        // 响应拦截器已把 BaseResponse 解包为 T，这里不能再取一次 .data.data
        const data = await this.instance.request(config)
        return data as unknown as T
      } catch (error) {
        if (retryCount < retry && this.shouldRetry(error as AxiosError)) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount))
          return attempt()
        }
        throw error
      }
    }

    return attempt()
  }

  public request<T = unknown>(config: CustomRequestConfig): Promise<T> {
    if (config.retry) {
      return this.requestWithRetry<T>(config)
    }
    return this.instance.request<BaseResponse<T>, T>(config) as unknown as Promise<T>
  }

  public get<T = unknown>(url: string, params?: RequestParams, config?: Omit<CustomRequestConfig, 'params' | 'method'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config
    })
  }

  public post<T = unknown>(url: string, data?: RequestData, config?: Omit<CustomRequestConfig, 'data' | 'method'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  public put<T = unknown>(url: string, data?: RequestData, config?: Omit<CustomRequestConfig, 'data' | 'method'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  public delete<T = unknown>(url: string, params?: RequestParams, config?: Omit<CustomRequestConfig, 'params' | 'method'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      params,
      ...config
    })
  }

  public patch<T = unknown>(url: string, data?: RequestData, config?: Omit<CustomRequestConfig, 'data' | 'method'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    })
  }

  public upload<T = unknown>(url: string, file: File, data?: RequestData, config?: Omit<CustomRequestConfig, 'data' | 'headers' | 'method'>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    if (data) {
      Object.keys(data as Record<string, unknown>).forEach(key => {
        formData.append(key, String((data as Record<string, unknown>)[key]))
      })
    }

    return this.request<T>({
      url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }

  public download(url: string, data?: RequestData, config?: Omit<CustomRequestConfig, 'responseType' | 'data' | 'method'>): Promise<void> {
    return this.request<Blob>({
      url,
      method: 'POST',
      data,
      responseType: 'blob',
      ...config
    }).then(blob => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = decodeURIComponent(new URL(url, import.meta.env.VITE_API_BASE_URL).pathname.split('/').pop() || 'download')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
  }
}

const defaultRequest = new RequestUtil({
  showLoading: true
})

export default defaultRequest
