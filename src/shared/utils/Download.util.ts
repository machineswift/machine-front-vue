/**
 * 文件下载工具（通用）
 *
 * 说明：
 *  - 后端下载类接口返回的是对象存储（MinIO）预签名地址；
 *  - 优先 fetch 转 Blob 后保存，可指定业务侧文件名称（如素材标题）；
 *  - 传入的名称缺少扩展名时，自动沿用 url 中的扩展名补全；
 *  - 对象存储未开放跨域（CORS）导致 fetch 失败时，回退为直接访问链接，
 *    由响应头 Content-Disposition: attachment 触发浏览器下载。
 */

/** 解析 url 中的文件扩展名（含点，如 .pdf）；解析不到时返回空串 */
const resolveUrlExtension = (url: string): string => {
  try {
    const name = new URL(url).pathname.split('/').pop() || ''
    const dotIndex = name.lastIndexOf('.')
    return dotIndex > 0 ? name.slice(dotIndex) : ''
  } catch {
    return ''
  }
}

/** 补全文件名称的扩展名 */
const resolveFileName = (url: string, fileName?: string): string | undefined => {
  if (!fileName) return undefined
  if (/\.[^./\\]+$/.test(fileName)) return fileName
  return fileName + resolveUrlExtension(url)
}

/** 通过链接触发浏览器保存文件 */
export const saveUrlAsFile = (url: string, fileName?: string): void => {
  const link = document.createElement('a')
  link.href = url
  if (fileName) link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 下载远程文件（url 为后端接口返回的预签名地址） */
export const downloadByUrl = async (url: string, fileName?: string): Promise<void> => {
  const name = resolveFileName(url, fileName)
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    const blobUrl = URL.createObjectURL(await response.blob())
    saveUrlAsFile(blobUrl, name)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.warn('Blob 下载失败, 回退为直接下载链接:', error)
    saveUrlAsFile(url, name)
  }
}
