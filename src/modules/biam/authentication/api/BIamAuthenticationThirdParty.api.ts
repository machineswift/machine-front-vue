import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import { getBaseUrl } from '@/shared/utils/Request.util'

const gitee = (): void => {
  window.location.href = getBaseUrl() + IAM_API_BASE_URL + 'iam/authentication/thirdParty/render/gitee'
}

const feiShu = (): void => {
  window.location.href = getBaseUrl() + IAM_API_BASE_URL + 'iam/authentication/thirdParty/render/fei_shu'
}

export const BIamAuthenticationThirdPartyApi = {
  gitee,
  feiShu
}
