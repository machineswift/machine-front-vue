import { cloneDeep } from 'lodash'
import { asyncRoute } from '@/router/Router.constant'

/**
 * 路由查找工具类
 * 提供三种快速查找路由的方式：
 * 1. 按路径(path)查找：routeLookup.getByPath('/scm/item/sku');
 * 2. 按名称(name)查找：routeLookup.getByName('SCM:ITEM:SKU');
 * 3. 按编码(code)查找：routeLookup.getByCode('SCM:ITEM:SKU');
 */
export class RouteLookup {
  // 按路径存储的Map
  private pathMap = new Map<string, ExtendedRouteRecordRaw>()

  // 按名称存储的Map
  private nameMap = new Map<string, ExtendedRouteRecordRaw>()

  // 按编码存储的Map
  private codeMap = new Map<string, ExtendedRouteRecordRaw>()

  constructor(routes: ExtendedRouteRecordRaw[]) {
    this.initialize(routes)
  }

  /**
   * 初始化路由查找表
   * @param routes 路由配置数组
   */
  private initialize(routes: ExtendedRouteRecordRaw[]) {
    const processRoutes = (routes: ExtendedRouteRecordRaw[]) => {
      routes.forEach(route => {
        // 添加到路径Map
        if (route.path) {
          this.pathMap.set(route.path, route)
        }

        // 添加到名称Map
        if (route.name && typeof route.name === 'string') {
          this.nameMap.set(route.name, route)
        }

        // 添加到编码Map
        if (route.meta?.code) {
          this.codeMap.set(route.meta.code, route)
        }

        // 递归处理子路由
        if (route.children) {
          processRoutes(route.children)
        }
      })
    }

    processRoutes(routes)
  }

  /**
   * 根据路径查找路由
   * @param path 路由路径
   * @returns 找到的路由配置或undefined
   */
  getByPath(path: string): ExtendedRouteRecordRaw | undefined {
    return this.pathMap.get(path)
  }

  /**
   * 根据名称查找路由
   * @param name 路由名称
   * @returns 找到的路由配置或undefined
   */
  getByName(name: string): ExtendedRouteRecordRaw | undefined {
    return this.nameMap.get(name)
  }

  /**
   * 根据编码查找路由
   * @param code 路由编码(来自meta.code)
   * @returns 找到的路由配置或undefined
   */
  getByCode(code: string): ExtendedRouteRecordRaw | undefined {
    return this.codeMap.get(code)
  }

  /**
   * 获取所有路由路径
   * @returns 所有路由路径数组
   */
  getAllPaths(): string[] {
    return Array.from(this.pathMap.keys())
  }

  /**
   * 获取所有路由名称
   * @returns 所有路由名称数组
   */
  getAllNames(): string[] {
    return Array.from(this.nameMap.keys())
  }

  /**
   * 获取所有路由编码
   * @returns 所有路由编码数组
   */
  getAllCodes(): string[] {
    return Array.from(this.codeMap.keys())
  }
}

export const routeLookup = new RouteLookup(cloneDeep(asyncRoute))
