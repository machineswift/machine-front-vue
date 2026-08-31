/**
 * 客户端密钥工具（通用）
 *
 * 密钥生成规则与后端 @StrongPassword 校验保持一致（StrongPasswordValidator）：
 *  - 默认长度 64 位
 *  - 至少包含 4 个特殊字符（!@#$%^&*()_+-=[]{};':"\|,.<>/?）
 *
 * 长度与特殊字符个数均支持动态传入，便于后续按业务扩展（如 32/128 位密钥）。
 * 生成使用 Web Crypto API（crypto.getRandomValues）保证密码学随机性，
 * 参考主流 IAM / OAuth2 服务（Keycloak、Auth0、Okta）客户端密钥生成策略。
 */

/** 默认密钥长度（与后端 StrongPassword 校验默认一致） */
export const DEFAULT_SECRET_LENGTH = 64

// 特殊字符集合：与后端规则兼容，并剔除易混淆或需转义（引号、反斜杠）的字符，便于复制使用
const SPECIAL_CHARS = '!@#$%^&*()_+-=<>?'

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/** 与后端 StrongPasswordValidator 保持一致的正则（支持动态长度，默认 64） */
export const buildStrongSecretPattern = (length: number = DEFAULT_SECRET_LENGTH): RegExp =>
  new RegExp(`^(?=(.*[!@#$%^&*()_+\\-=[\\]{};':"\\\\|,.<>/?]){4,}).{${length},}$`)

/** 默认长度（64 位）的强密码校验正则 */
export const STRONG_SECRET_PATTERN = buildStrongSecretPattern(DEFAULT_SECRET_LENGTH)

const randomIndex = (max: number): number => {
  // 使用拒绝采样（rejection sampling）消除取模偏差（modulo bias），保证均匀随机
  const limit = Math.floor(0x100000000 / max) * max
  const buffer = new Uint32Array(1)
  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % max
}

/** 生成符合规则的客户端密钥（默认 64 位、至少 4 个特殊字符） */
export const generateClientSecret = (length: number = DEFAULT_SECRET_LENGTH, specialCount: number = 4): string => {
  const count = Math.max(0, Math.min(specialCount, length))
  const chars: string[] = []

  // 先放入特殊字符，确保通过后端校验
  for (let i = 0; i < count; i++) {
    chars.push(SPECIAL_CHARS[randomIndex(SPECIAL_CHARS.length)])
  }

  // 其余位置填充字母与数字
  for (let i = count; i < length; i++) {
    chars.push(ALPHANUMERIC[randomIndex(ALPHANUMERIC.length)])
  }

  // Fisher-Yates 洗牌，打乱特殊字符的位置
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    const tmp = chars[i]
    chars[i] = chars[j]
    chars[j] = tmp
  }

  return chars.join('')
}

/** 复制文本到剪贴板（优先使用 Clipboard API，非安全上下文时降级为 execCommand） */
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
