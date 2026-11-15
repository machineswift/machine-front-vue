/**
 * 客户端密钥工具（通用）
 */
export const DEFAULT_SECRET_LENGTH = 64

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const buildStrongSecretPattern = (length: number = DEFAULT_SECRET_LENGTH): RegExp => new RegExp(`^.{${length},}$`)

/** 默认长度（64 位）的客户端密钥校验正则 */
export const STRONG_SECRET_PATTERN = buildStrongSecretPattern(DEFAULT_SECRET_LENGTH)

const randomIndex = (max: number): number => {
  const limit = Math.floor(0x100000000 / max) * max
  const buffer = new Uint32Array(1)
  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % max
}

export const generateClientSecret = (length: number = DEFAULT_SECRET_LENGTH): string => {
  const chars: string[] = []

  for (let i = 0; i < length; i++) {
    chars.push(ALPHANUMERIC[randomIndex(ALPHANUMERIC.length)])
  }

  return chars.join('')
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}
