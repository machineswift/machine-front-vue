import { IAM_API_BASE_URL } from '@/common/constant/Common.constant'
import { getBaseUrl } from '@/common/utils/Request.util'

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
