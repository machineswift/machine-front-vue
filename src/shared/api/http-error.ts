import type { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

interface HttpErrorBody {
  message?: string
  path?: string
}

/**
 * 把 axios 的 HTTP 错误映射为统一的用户提示。
 *
 * 独立于 RequestUtil：错误文案属于“展示层策略”，
 * 请求实例只负责发起与拦截，不负责决定每种状态码显示什么。
 */
export function handleHttpError(error: AxiosError): void {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data as HttpErrorBody | undefined

    if (data?.message) {
      ElMessage.error(data.message)
      return
    }

    switch (status) {
      case 400:
        ElMessage.error('请求参数错误')
        break
      case 403:
        ElMessage.error('您没有权限执行此操作')
        break
      case 404:
        ElMessage.error('请求资源不存在')
        break
      case 422:
        ElMessage.error('业务规则校验失败')
        break
      case 500:
        ElMessage.error('服务器内部错误')
        break
      case 503:
        ElMessage.error('服务不可用' + (data?.path ? `，${data.path}` : ''))
        break
      default:
        ElMessage.error(`请求失败: ${status}`)
    }
  } else if (error.request) {
    ElMessage.error('请求超时，请检查网络连接')
  } else {
    ElMessage.error(error.message)
  }
}
