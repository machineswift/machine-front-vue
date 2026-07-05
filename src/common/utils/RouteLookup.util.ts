import { asyncRoute } from '@/router/modules'
import router from '@/router'
import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'
import type { RouteRecordNormalized } from 'vue-router'

/**
 * 路由查找工具类
 * 使用 Vue Router 的 getRoutes() 方法进行查找，支持动态路由更新
 * 提供三种快速查找路由的方式：
 * 1. 按路径(path)查找：routeLookup.getByPath('/scm/item/sku');
 * 2. 按名称(name)查找：routeLookup.getByName('SCM:ITEM:SKU');
 * 3. 按编码(code)查找：routeLookup.getByCode('SCM:ITEM:SKU');
 */
export class RouteLookup {
  /**
   * 从路由配置中查找路由（用于权限树转换）
   * @param code 路由编码
   * @returns 找到的路由配置或undefined
   */
  getByCode(code: string): ExtendedRouteRecordRaw | undefined {
    const findInRoutes = (routes: ExtendedRouteRecordRaw[]): ExtendedRouteRecordRaw | undefined => {
      for (const route of routes) {
        if (route.meta?.code === code) {
          return route
        }
        if (route.children) {
          const found = findInRoutes(route.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findInRoutes(asyncRoute)
  }

  /**
   * 从 Vue Router 实例中查找路由（用于运行时查找）
   * @param path 路由路径
   * @returns 找到的路由或undefined
   */
  getByPath(path: string): RouteRecordNormalized | undefined {
    return router.getRoutes().find(route => route.path === path)
  }

  /**
   * 从 Vue Router 实例中按名称查找路由
   * @param name 路由名称
   * @returns 找到的路由或undefined
   */
  getByName(name: string | symbol): RouteRecordNormalized | undefined {
    return router.getRoutes().find(route => route.name === name)
  }

  /**
   * 从 Vue Router 实例中按编码查找路由
   * @param code 路由编码
   * @returns 找到的路由或undefined
   */
  getByCodeFromRouter(code: string): RouteRecordNormalized | undefined {
    return router.getRoutes().find(route => route.meta?.code === code)
  }

  /**
   * 获取所有路由路径
   * @returns 所有路由路径数组
   */
  getAllPaths(): string[] {
    return router.getRoutes().map(route => route.path)
  }

  /**
   * 获取所有路由名称
   * @returns 所有路由名称数组
   */
  getAllNames(): (string | symbol)[] {
    return router
      .getRoutes()
      .map(route => route.name)
      .filter(Boolean) as (string | symbol)[]
  }

  /**
   * 获取所有路由编码
   * @returns 所有路由编码数组
   */
  getAllCodes(): string[] {
    return router
      .getRoutes()
      .map(route => route.meta?.code)
      .filter((code): code is string => typeof code === 'string')
  }
}

export const routeLookup = new RouteLookup()
