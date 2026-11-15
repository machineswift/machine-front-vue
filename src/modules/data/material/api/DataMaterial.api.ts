import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataMaterialCreateRequestVo,
  DataMaterialUpdateRequestVo,
  DataMaterialUpdateCategoryRequestVo,
  DataMaterialQueryPageRequestVo,
  DataMaterialDetailResponseVo,
  DataMaterialExpandPageResponse
} from '../type/DataMaterial.type'

const create = async (params: DataMaterialCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/data/file_center/material/create'), params, { timeout: 1800000 })
}

const update = async (params: DataMaterialUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/file_center/material/update'), params, { timeout: 1800000 })
}

const updateCategory = async (params: DataMaterialUpdateCategoryRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/file_center/material/update_category'), params)
}

const detail = async (params: IdRequest): Promise<DataMaterialDetailResponseVo> => {
  return request.post<DataMaterialDetailResponseVo>(adminApi('admin/data/file_center/material/detail'), params)
}

const pageExpand = async (params: DataMaterialQueryPageRequestVo): Promise<DataMaterialExpandPageResponse> => {
  return request.post<DataMaterialExpandPageResponse>(adminApi('admin/data/file_center/material/page_expand'), params)
}

export const DataMaterialApi = {
  create,
  update,
  updateCategory,
  detail,
  pageExpand
}

// ---------- 素材文件类型识别与校验 ----------

/** 素材文件大小上限（MB），与后端 multipart 配置保持一致 */
export const MATERIAL_FILE_MAX_SIZE_MB = 2048

/** 扩展名 -> 素材文件类型（与后端 DataFileTypeEnum 对齐，用于前端预判） */
const EXTENSION_TYPE_MAP: Record<string, string> = {
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  png: 'IMAGE',
  gif: 'IMAGE',
  bmp: 'IMAGE',
  webp: 'IMAGE',
  svg: 'IMAGE',
  ico: 'IMAGE',
  tif: 'IMAGE',
  tiff: 'IMAGE',
  heic: 'IMAGE',
  avif: 'IMAGE',

  mp4: 'VIDEO',
  mov: 'VIDEO',
  avi: 'VIDEO',
  mkv: 'VIDEO',
  wmv: 'VIDEO',
  flv: 'VIDEO',
  webm: 'VIDEO',
  m4v: 'VIDEO',
  mpeg: 'VIDEO',
  mpg: 'VIDEO',
  '3gp': 'VIDEO',

  mp3: 'AUDIO',
  wav: 'AUDIO',
  flac: 'AUDIO',
  aac: 'AUDIO',
  ogg: 'AUDIO',
  m4a: 'AUDIO',
  wma: 'AUDIO',
  aiff: 'AUDIO',
  amr: 'AUDIO',

  doc: 'DOCUMENT',
  docx: 'DOCUMENT',
  pdf: 'DOCUMENT',
  txt: 'DOCUMENT',
  rtf: 'DOCUMENT',
  odt: 'DOCUMENT',
  pages: 'DOCUMENT',
  md: 'DOCUMENT',

  xls: 'SPREADSHEET',
  xlsx: 'SPREADSHEET',
  csv: 'SPREADSHEET',
  ods: 'SPREADSHEET',
  numbers: 'SPREADSHEET',

  ppt: 'PRESENTATION',
  pptx: 'PRESENTATION',
  odp: 'PRESENTATION',
  key: 'PRESENTATION',

  zip: 'ARCHIVE',
  rar: 'ARCHIVE',
  '7z': 'ARCHIVE',
  tar: 'ARCHIVE',
  gz: 'ARCHIVE',
  bz2: 'ARCHIVE',
  xz: 'ARCHIVE',

  exe: 'EXECUTABLE',
  msi: 'EXECUTABLE',
  dmg: 'EXECUTABLE',
  app: 'EXECUTABLE',
  deb: 'EXECUTABLE',
  rpm: 'EXECUTABLE',
  apk: 'EXECUTABLE',

  js: 'CODE',
  jsx: 'CODE',
  ts: 'CODE',
  tsx: 'CODE',
  vue: 'CODE',
  java: 'CODE',
  py: 'CODE',
  c: 'CODE',
  cpp: 'CODE',
  h: 'CODE',
  hpp: 'CODE',
  cs: 'CODE',
  go: 'CODE',
  rs: 'CODE',
  php: 'CODE',
  rb: 'CODE',
  swift: 'CODE',
  kt: 'CODE',
  sh: 'CODE',
  html: 'CODE',
  htm: 'CODE',
  css: 'CODE',
  scss: 'CODE',
  less: 'CODE',

  json: 'CONFIG',
  yaml: 'CONFIG',
  yml: 'CONFIG',
  xml: 'CONFIG',
  ini: 'CONFIG',
  conf: 'CONFIG',
  properties: 'CONFIG',
  toml: 'CONFIG',
  env: 'CONFIG',

  ttf: 'FONT',
  otf: 'FONT',
  woff: 'FONT',
  woff2: 'FONT',
  eot: 'FONT',

  obj: 'MODEL_3D',
  fbx: 'MODEL_3D',
  stl: 'MODEL_3D',
  gltf: 'MODEL_3D',
  glb: 'MODEL_3D',
  '3ds': 'MODEL_3D',
  dae: 'MODEL_3D',
  blend: 'MODEL_3D',

  dwg: 'CAD',
  dxf: 'CAD',
  step: 'CAD',
  stp: 'CAD',
  iges: 'CAD',
  igs: 'CAD',

  epub: 'E_BOOK',
  mobi: 'E_BOOK',
  azw3: 'E_BOOK',

  sql: 'DATABASE',
  db: 'DATABASE',
  sqlite: 'DATABASE',
  mdb: 'DATABASE',

  log: 'LOG',

  sys: 'SYSTEM',
  dll: 'SYSTEM',
  so: 'SYSTEM',
  dylib: 'SYSTEM',

  tmp: 'TEMPORARY',
  temp: 'TEMPORARY'
}

const TYPE_EXTENSION_MAP: Record<string, string[]> = Object.entries(EXTENSION_TYPE_MAP).reduce(
  (map, [ext, type]) => {
    ;(map[type] ??= []).push(ext)
    return map
  },
  {} as Record<string, string[]>
)

export const getFileExtension = (fileName: string): string => {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : ''
}

export const detectFileTypeByExtension = (fileName: string): string | undefined => {
  return EXTENSION_TYPE_MAP[getFileExtension(fileName)]
}

/** 文件选择框 accept：已选类型时只允许同类文件 */
export const getAcceptByFileType = (fileType?: string): string => {
  if (!fileType) return ''
  return (TYPE_EXTENSION_MAP[fileType] ?? []).map(ext => `.${ext}`).join(',')
}

export interface MaterialFileValidationResult {
  valid: boolean
  message?: string
}

export const validateMaterialFile = (file: File, expectedFileType?: string): MaterialFileValidationResult => {
  if (!file) {
    return { valid: false, message: '请选择文件' }
  }
  if (file.size > MATERIAL_FILE_MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, message: `文件大小不能超过 ${MATERIAL_FILE_MAX_SIZE_MB}MB` }
  }
  if (expectedFileType) {
    const detected = detectFileTypeByExtension(file.name)
    if (detected && detected !== expectedFileType) {
      return { valid: false, message: '仅支持替换为与当前素材相同类型的文件' }
    }
  }
  return { valid: true }
}

/** 去掉扩展名，用于自动填充素材标题 */
export const stripFileExtension = (fileName: string): string => {
  const index = fileName.lastIndexOf('.')
  return index > 0 ? fileName.slice(0, index) : fileName
}

export const formatFileSize = (size?: number): string => {
  if (size == null || size < 0) return '-'
  if (size < 1024) return `${size} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  let value = size / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`
}
