import { ADMIN_API_BASE_URL, IAM_API_BASE_URL } from '@/shared/constants/Common.constant'

export const adminApi = (path: string) => ADMIN_API_BASE_URL + path.replace(/^\//, '')
export const iamApi = (path: string) => IAM_API_BASE_URL + path.replace(/^\//, '')
