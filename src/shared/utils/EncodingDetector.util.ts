/**
 * 文本文件编码检测与自动转换工具
 *
 * 自动检测文本文件的编码（如 GBK、GB2312、BIG5、Shift_JIS 等），
 * 并将其转换为 UTF-8，避免预览时出现乱码。
 */

import jschardet from 'jschardet'

/**
 * jschardet 返回的编码名到 TextDecoder 支持编码名的映射
 */
const encodingMap: Record<string, string> = {
  'UTF-8': 'utf-8',
  'UTF-16LE': 'utf-16le',
  'UTF-16BE': 'utf-16be',
  ASCII: 'ascii',
  'ISO-8859-1': 'latin1',
  GB2312: 'gbk',
  GBK: 'gbk',
  GB18030: 'gb18030',
  BIG5: 'big5',
  'BIG5-HKSCS': 'big5',
  Shift_JIS: 'shift-jis',
  'EUC-JP': 'euc-jp',
  'EUC-KR': 'euc-kr',
  'ISO-2022-JP': 'iso-2022-jp',
  'windows-1252': 'windows-1252',
  'KOI8-R': 'koi8-r',
  IBM866: 'ibm866'
}

/**
 * 将 ArrayBuffer 转换为 jschardet 可分析的二进制字符串
 * 使用 Latin-1 编码解码，每个字节映射为对应 Latin-1 字符（0-255 → U+0000~U+00FF）
 */
function bufferToBinaryString(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer)
  // 分块处理，避免 call stack 溢出
  const chunkSize = 8192
  const chunks: string[] = []
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, Math.min(i + chunkSize, uint8.length))
    chunks.push(String.fromCharCode.apply(null, chunk as unknown as number[]))
  }
  return chunks.join('')
}

/**
 * 检测 ArrayBuffer 的文本编码
 * @param buffer - 原始二进制数据
 * @param minimumConfidence - 最低可信度阈值（默认 0.3）
 * @returns 检测到的编码名（小写），如果无法识别则返回 'utf-8'
 */
export function detectEncoding(buffer: ArrayBuffer, minimumConfidence = 0.3): string {
  const binaryStr = bufferToBinaryString(buffer)
  const result = jschardet.detect(binaryStr)

  if (result && result.encoding && result.confidence >= minimumConfidence) {
    // 映射到 TextDecoder 支持的编码名
    const detected = encodingMap[result.encoding]
    if (detected) {
      return detected
    }
    // 直接返回小写形式
    return result.encoding.toLowerCase()
  }

  // 默认返回 UTF-8
  return 'utf-8'
}

/**
 * 将 ArrayBuffer 按检测到的编码解码为字符串
 * @param buffer - 原始二进制数据
 * @param encoding - 编码名（可选，不传则自动检测）
 * @returns 解码后的字符串
 */
export function decodeBuffer(buffer: ArrayBuffer, encoding?: string): string {
  const enc = encoding || detectEncoding(buffer)
  try {
    const decoder = new TextDecoder(enc, { fatal: false })
    return decoder.decode(buffer)
  } catch {
    // 如果指定编码解码失败，回退到 UTF-8
    const fallbackDecoder = new TextDecoder('utf-8', { fatal: false })
    return fallbackDecoder.decode(buffer)
  }
}

/**
 * 将 ArrayBuffer 转换为 UTF-8 Blob
 * 自动检测原始编码并转码为 UTF-8
 * @param buffer - 原始二进制数据
 * @param originalName - 原始文件名（用于日志）
 * @returns UTF-8 编码的 Blob
 */
export function convertToUtf8Blob(buffer: ArrayBuffer, _originalName?: string): Blob {
  const detectedEncoding = detectEncoding(buffer)

  if (detectedEncoding === 'utf-8') {
    // 已经是 UTF-8，直接返回
    return new Blob([buffer], { type: 'text/plain;charset=utf-8' })
  }

  // 解码原始内容
  const text = decodeBuffer(buffer, detectedEncoding)

  // 重新编码为 UTF-8
  const encoder = new TextEncoder()
  const utf8Bytes = encoder.encode(text)

  return new Blob([utf8Bytes], { type: 'text/plain;charset=utf-8' })
}

/**
 * 判断文件扩展名是否为文本文件
 */
const textExtensions = new Set([
  'txt',
  'text',
  'log',
  'md',
  'markdown',
  'csv',
  'tsv',
  'ini',
  'cfg',
  'conf',
  'config',
  'yml',
  'yaml',
  'toml',
  'json',
  'xml',
  'html',
  'htm',
  'css',
  'scss',
  'less',
  'js',
  'ts',
  'jsx',
  'tsx',
  'java',
  'py',
  'rb',
  'php',
  'go',
  'rs',
  'swift',
  'kt',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'sh',
  'bash',
  'bat',
  'ps1',
  'sql',
  'r',
  'lua',
  'pl',
  'pm'
])

export function isTextFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return textExtensions.has(ext)
}

/**
 * 从 URL 获取 ArrayBuffer
 */
export async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
  }
  return response.arrayBuffer()
}

/**
 * 将文件读取为 ArrayBuffer
 */
export function fileToArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}
