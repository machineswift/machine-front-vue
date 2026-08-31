/**
 * IP 白名单工具（通用）
 *
 * 支持的条目格式：
 *  - 单个 IPv4：192.168.1.1
 *  - 单个 IPv6：2001:db8::1（支持方括号包裹与 :: 压缩写法）
 *
 * 说明：
 *  - 后端仅以 TreeSet<String> 存储（JSON 数组），不做格式校验；
 *    本工具在前端录入阶段进行格式校验与去重排序，保证白名单数据整洁。
 *  - 排序规则与后端 TreeSet 一致（按字符串码点升序），因此使用默认 sort()。
 */

const IPV4_GROUP = /^\d{1,3}$/

/** 校验单个 IPv4 地址（拒绝前导零，如 010.0.0.1） */
export const isValidIpv4 = (ip: string): boolean => {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(part => {
    if (!IPV4_GROUP.test(part)) return false
    if (part.length > 1 && part.startsWith('0')) return false
    const num = Number(part)
    return num >= 0 && num <= 255
  })
}

const IPV6_GROUP = /^[0-9a-fA-F]{1,4}$/

/** 校验单个 IPv6 地址（支持 :: 压缩；可选外层方括号） */
export const isValidIpv6 = (ip: string): boolean => {
  const value = ip.trim().replace(/^\[|\]$/g, '')
  if (!value || value.includes(':::')) return false

  // 只允许出现一次 :: 压缩标记，否则非法
  const parts = value.split('::')
  if (parts.length > 2) return false

  const [leftPart, rightPart] = parts
  const hasCompression = value.includes('::')
  const leftGroups = leftPart ? leftPart.split(':') : []
  const rightGroups = rightPart ? rightPart.split(':') : []

  const groupsValid = (groups: string[]): boolean => groups.every(group => IPV6_GROUP.test(group))
  if (!groupsValid(leftGroups) || !groupsValid(rightGroups)) return false

  // 无 :: 必须是完整的 8 组；有 :: 时左右两组之和必须小于 8
  return hasCompression ? leftGroups.length + rightGroups.length < 8 : leftGroups.length === 8
}

/** 校验单条白名单条目（仅支持 IPv4 / IPv6 单个地址） */
export const isValidIpEntry = (entry: string): boolean => {
  const value = entry.trim()
  if (!value) return false
  return isValidIpv4(value) || isValidIpv6(value)
}

/** 分隔符集合：空格、英文/中文逗号、英文/中文分号、换行 */
const SPLIT_SEPARATORS = /[\s,，;；]+/

/** 将一段输入文本拆分为若干条候选条目（支持批量粘贴） */
export const splitIpText = (text: string): string[] =>
  text
    .split(SPLIT_SEPARATORS)
    .map(item => item.trim())
    .filter(Boolean)

/** 去重并按字符串码点排序（与后端 TreeSet 行为一致），同时去除空白 */
export const normalizeIpEntries = (entries: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const entry of entries) {
    const value = (entry || '').trim()
    if (value && !seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result.sort()
}
