import { iamApi } from '@/shared/api/endpoints'
import { getBaseUrl } from '@/shared/utils/Request.util'

const gitee = (): void => {
  window.location.href = getBaseUrl() + iamApi('iam/authentication/thirdParty/render/gitee')
}

const feiShu = (): void => {
  window.location.href = getBaseUrl() + iamApi('iam/authentication/thirdParty/render/fei_shu')
}

export const BIamAuthenticationThirdPartyApi = {
  gitee,
  feiShu
}
