/**
 * JSON 文本工具：用于表单中以文本形式编辑后端 Object 类型字段（如重试策略、载荷结构）
 */

/** 校验可选 JSON 文本：留空通过，填写时必须是合法的 JSON 对象/数组 */
export const validateJsonObject = (_rule: unknown, value: string, callback: (error?: Error) => void): void => {
  if (!value || !value.trim()) {
    callback()
    return
  }
  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed === null || typeof parsed !== 'object') {
      callback(new Error('必须为 JSON 对象或数组'))
      return
    }
    callback()
  } catch {
    callback(new Error('不是合法的 JSON'))
  }
}

/** 将后端对象值格式化为可编辑的 JSON 文本，空值返回空串 */
export const formatJsonText = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

/** 将表单中的 JSON 文本转为提交值：留空返回 null，否则解析为对象 */
export const parseJsonText = (value?: string): Record<string, unknown> | null => {
  if (!value || !value.trim()) return null
  return JSON.parse(value) as Record<string, unknown>
}
