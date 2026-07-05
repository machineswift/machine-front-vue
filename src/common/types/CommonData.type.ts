export interface AddressInfoDto {
  /**
   * 国家，默认:中国（CHINA）
   */
  country?: string
  countryCode?: string

  /**
   * 省
   */
  province?: string
  provinceCode?: string

  /**
   * 市
   */
  city?: string
  cityCode?: string

  /**
   * 区
   */
  area?: string
  areaCode?: string

  /**
   * 街道
   */
  town?: string
  townCode?: string
  address?: string
}
