<div align="center">

# 🚀 Machine 企业级智能管理平台

![Vue](https://img.shields.io/badge/Vue_3-3.5.40-brightgreen?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.14.3-success?logo=element)
![Vite](https://img.shields.io/badge/Vite-8.1.5-orange?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-4.0.2-yellow?logo=pinia)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**基于 Vue 3 + TypeScript + Element Plus + Vite + Pinia 企业级智能管理平台 · 与 Machine 后端无缝对接**

 [在线演示](#-在线演示) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [项目结构](#-项目结构)

</div>

---

## 📖 项目简介

**Machine Front Vue** 是 Machine 企业级智能管理平台的统一前端界面，与 [Machine Monolith Java](https://gitee.com/machineswift/machine-monolith-java) 及 [Machine 微服务平台](https://gitee.com/machineswift/machine) 后端配套使用。采用模块化架构，覆盖权限管理（BIAM）、数据管理、CRM、SCM、流程中心、智能中心、商业智能等企业核心业务，支持动态路由与细粒度权限控制。

前端采用 **双模式架构**：对外提供 **官网门户**（品牌宣介、产品展示、研发工具集），对内提供 **企业管理控制台**（权限、数据、业务全流程管理），统一路由体系与共享模块，兼具品牌呈现与业务管理能力。

---

### 🎮 在线演示

> **👉 [http://www.machinerust.cn](http://www.machinerust.cn)**

| 角色    | 账号      | 密码       |
|-------|---------|----------|
| 👤 访客 | `demo`  | `123456` |
| 👤 访客 | `guest` | `123456` |

---

## 🔧 技术栈

| 技术                              | 版本      | 说明                                   |
|---------------------------------|---------|--------------------------------------|
| **Vue 3**                       | 3.5.40  | 渐进式前端框架（Composition API）             |
| **TypeScript**                  | 6.0.3   | 类型安全                                 |
| **Element Plus**                | 2.14.3  | Vue 3 UI 组件库                         |
| **Vite**                        | 8.1.5   | 构建工具与开发服务器                           |
| **Pinia**                       | 4.0.2   | 状态管理                                 |
| **pinia-plugin-persistedstate** | 4.7.1   | Pinia 状态持久化                          |
| **Vue Router**                  | 5.2.0   | 路由（常量路由 + 动态路由 + 路由守卫 + RouteLookup） |
| **Axios**                       | 1.18.1  | HTTP 请求（含自动刷新 Token、请求取消、请求重试）       |
| **Sass**                        | 1.102.0 | CSS 预处理器（modern-compiler API）        |
| **CodeMirror 6**                | 6.0.2   | 代码编辑器核心（JSON / Markdown 语法高亮）        |
| **marked**                      | 18.0.7  | Markdown 编译渲染                        |
| **highlight.js**                | 11.11.1 | 代码语法高亮                               |
| **mermaid**                     | 11.16.0 | 流程图/图表渲染                             |
| **Fuse.js**                     | 7.5.0   | 前端模糊搜索                               |
| **Vue Draggable Plus**          | 0.6.1   | 拖拽组件（标签页、权限范围）                       |
| **@file-viewer/vue3-full**      | 2.2.3   | 在线文件预览（200+ 格式）                      |
| **jschardet**                   | 3.1.4   | 文件编码检测                               |
| **Lodash (lodash-es)**          | 4.17.21 | 实用工具库                                |
| **NProgress**                   | 0.2.0   | 页面加载进度条                              |
| **vue-tsc**                     | 3.3.8   | 类型检查                                 |
| **@element-plus/icons-vue**     | 2.3.2   | Element Plus 图标库                     |
| **vite-plugin-svg-icons**       | 2.0.1   | SVG 图标雪碧图自动注册                        |
| **lightningcss**                | 1.29.0  | CSS 编译器（Vite 构建加速）                   |
| **ESLint**                      | 10.8.0  | 代码规范检查（Flat Config）                  |
| **Prettier**                    | 3.9.6   | 代码格式化                                |
| **Stylelint**                   | 17.14.1 | 样式规范检查                               |
| **Husky**                       | 9.1.7   | Git 提交钩子                             |
| **Lint-staged**                 | 17.2.0  | 暂存文件 lint 检查                         |

---

## 🚀 快速开始

### 环境要求

- **Node.js** 22.12+（Vite 8 / ESLint 10 要求）
- **npm** 10+ / **yarn** 1.22+ / **pnpm** 9+

### 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（默认 http://localhost:5173）
npm run dev
```

### 构建与预览

```bash
# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

### 代码规范

```bash
# TypeScript 类型检查
npm run typecheck

# ESLint 检查
npm run lint:check

# ESLint 自动修复
npm run lint:format
```

---

## 📁 项目结构

```
machine-front-vue/
├── src/
│   ├── shared/                        # 共享模块（统一公共资源）
│   │   ├── api/                       # 公共接口（字典枚举等）
│   │   ├── components/                # 公共组件（SvgIcon、IpWhitelistEditor、UriListEditor）
│   │   ├── composables/               # 组合式函数（useEnumOptions 枚举选项）
│   │   ├── constants/                 # 公共常量（路由、门户、通用、字典枚举）
│   │   ├── directives/                # 自定义指令（v-hasPermission）
│   │   ├── stores/                    # 全局状态管理
│   │   │   ├── IamUser.store.ts       # 用户认证与权限
│   │   │   ├── LayoutTab.store.ts     # 标签页管理
│   │   │   ├── SystemSetting.store.ts # 系统设置
│   │   │   └── DictionaryEnum.store.ts# 字典枚举
│   │   ├── types/                     # 公共类型定义
│   │   └── utils/                     # 工具类（Request、Permission、TreeData、RouteLookup、EncodingDetector、IpAddress、Secret）
│   ├── views/                         # 页面视图（官网门户 + 管理后台）
│   │   ├── website/                   # 官网门户
│   │   │   ├── portal/                # 门户页面（首页、产品、关于、联系）
│   │   │   ├── tools/                 # 研发工具（Markdown、JSON、文件预览等）
│   │   │   ├── error/                 # 错误页面（404）
│   │   │   ├── components/            # 门户公共组件（Header、Footer）
│   │   │   └── composables/           # 门户组合式函数（主题切换）
│   │   └── admin/                     # 管理后台
│   │       ├── layout/                # 后台布局（侧栏、标签页、导航）
│   │       ├── auth/                  # 登录页、OAuth2 回调
│   │       └── home/                  # 后台首页（应用中心、程序坞、全局搜索）
│   ├── modules/                       # 业务模块（按领域拆分）
│   │   ├── biam/                      # 权限（组织/角色/用户/菜单、认证中心-客户端、日志中心-操作/登录/访问）
│   │   ├── data/                      # 数据（品牌、区域、门店、标签、素材、附件、下载）
│   │   ├── crm/                       # 客户管理、会员管理
│   │   ├── scm/                       # 供应链（类目、商品 SKU/SPU/属性）
│   │   ├── pce/                       # 流程中心（流程管理、任务中心、流程运维）
│   │   ├── ai/                        # 智能中心（资源中心-厂商/模型）
│   │   └── bi/                        # 商业智能（智能看板）
│   ├── router/                        # 路由（常量路由 + 动态路由 + 路由守卫）
│   │   ├── modules/                   # 各模块动态路由配置（system/scm/crm/bi/pce/ai）
│   │   ├── utils/                     # 路由工具函数
│   │   ├── index.ts                   # 路由实例（含 NProgress 进度条）
│   │   └── guards.ts                  # 路由守卫（认证检查 + 重定向 + 过渡动画）
│   ├── styles/                        # 全局样式与变量（SCSS）
│   │   ├── index.scss                 # 全局样式（图片预览、滚动条等）
│   │   ├── reset.scss                 # 样式重置
│   │   ├── variables.scss             # SCSS 变量
│   │   └── portal/                    # 门户样式（主题与布局）
│   ├── assets/                        # 静态资源（图标、图片）
│   │   └── icons/                     # SVG 图标（自动注册为雪碧图）
│   ├── setting.ts                     # 应用标题、Logo 等配置
│   └── main.ts                        # 应用入口（异步路由初始化后挂载）
├── public/                            # 公共静态资源
│   └── file-viewer/                   # 文件预览静态资源
├── .env                               # 环境变量（公共）
├── vite.config.ts                     # Vite 配置（含 SVG 插件、JSX、SCSS 变量注入）
├── tsconfig.json                      # TypeScript 配置
├── eslint.config.js                   # ESLint 扁平化配置（ESLint 9 Flat Config）
├── .stylelintrc.json                  # Stylelint 配置
└── package.json
```

### 模块说明

| 模块          | 目录               | 说明                                                      |
|-------------|------------------|---------------------------------------------------------|
| **Shared**  | `shared/`        | 公共组件、指令、工具类、状态管理、类型定义、常量（统一入口）                          |
| **Website** | `views/website/` | 官网门户（品牌首页、产品特性、关于联系）及研发工具集                              |
| **Admin**   | `views/admin/`   | 管理后台布局（侧栏、标签页、导航）、登录认证                                  |
| **BIAM**    | `modules/biam/`  | 权限管理（组织/角色/用户/菜单）、认证中心（OAuth2 客户端管理）、日志中心（操作/登录/访问日志）   |
| **Data**    | `modules/data/`  | 品牌、区域、门店、标签、素材、附件、下载中心                                  |
| **CRM**     | `modules/crm/`   | 客户管理、会员管理                                               |
| **SCM**     | `modules/scm/`   | 类目管理（前台/后台/属性）、商品管理（SKU/SPU/商品属性）                       |
| **AI**      | `modules/ai/`    | 智能中心-资源中心（厂商管理、模型管理）                                    |
| **PCE**     | `modules/pce/`   | 流程管理（建模/表单设计/模板/部署）、任务中心（待办/发起/抄送/已办）、流程运维（运行/历史/异常/监控） |
| **BI**      | `modules/bi/`    | 商业智能看板                                                  |

---

## ⚙️ 项目配置

### 环境变量

`.env`（公共）及模式文件配置接口与环境：

```env
# API 基础路径
VITE_API_BASE_URL=/machine-gateway-server/

# 开发环境后端地址
VITE_SERVER_DEV=http://127.0.0.1:8080

# 生产环境后端地址
VITE_SERVER_PROD=http://api.machinerust.cn
```

### 应用设置

标题、Logo 等见 **`src/setting.ts`**，按需修改即可。

```ts
export const appSetting = {
  logo: '/logo.png',
  title: 'machine',
  logoHidden: true
}
```

---

## 🔐 权限系统

### 权限指令

```vue
<template>
  <!-- 单个权限 -->
  <button v-hasPermission="'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:CREATE'">创建用户</button>

  <!-- 多权限满足其一 -->
  <button v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:CREATE', 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:UPDATE']">创建/编辑</button>

  <!-- 无权限时的自定义提示 -->
  <button v-hasPermission:导出用户="'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:EXPORT'">导出用户</button>
</template>
```

### 路由权限

- **常量路由**：登录、官网、404 等固定页面
- **动态路由**：根据用户权限从后端拉取并注册，保证仅可访问有权限的菜单与页面
- **路由守卫**：自动检测认证状态，未登录重定向至登录页并携带回跳地址

权限工具类 `PermissionUtil` 提供权限校验、列表获取等能力，可与指令、路由配合使用。

---

## 📦 核心架构设计

### 路由系统

采用 **常量路由 + 动态路由** 双轨架构，路由按场景划分为 **官网门户** 与 **管理后台** 两大区域：

**路由层级设计：**
- `/` — 官网首页（公共访问）
- `/website/portal/*` — 官网门户（产品、关于、联系等）
- `/website/tools/*` — 研发工具（Markdown、JSON、文件预览等）
- `/admin/*` — 管理后台（需认证）：`/admin/system`（基础数据 / 权限管理 / 认证中心 / 日志中心 / 工作台）、`/admin/scm`、`/admin/crm`、`/admin/bi`、`/admin/pce`、`/admin/ai`（财务 / 人力模块预留）
- `/:pathMatch(.*)*` — 404 页面

**路由特性：**
- **Hash 路由**：`createWebHashHistory()`
- **公共路由白名单**：官网门户及认证页免登录，其余路由自动触发认证检查
- **路由过渡动画**：支持 `slide-left`、`slide-right`、`material`、`flip`、`bounce` 等多种动效，根据页面深度自动切换
- **异步路由初始化**：应用启动时异步加载用户权限路由，登录态失效自动重定向
- **路由查找工具**：`RouteLookup` 工具类提供按路径（`getByPath`）、名称（`getByName`）、编码（`getByCode`）三种方式快速定位路由
- **重定向处理**：已认证用户访问登录页自动跳转首页，含子路由的父级路由自动查找首个子路由

### 状态管理（Pinia）

采用 Pinia + `pinia-plugin-persistedstate` 实现状态持久化：
- **`IamUser.store`**：用户认证信息、权限数据、动态路由管理，含 Token 自动刷新与并发控制
- **`LayoutTab.store`**：多标签页管理（添加、关闭、刷新、固定、状态保持）
- **`SystemSetting.store`**：主题、布局等系统设置
- **`DictionaryEnum.store`**：字典枚举数据缓存

### HTTP 请求（Axios）

`RequestUtil` 封装了统一的请求/响应拦截器：
- 自动注入 `Bearer Token`
- 401 时自动刷新 Token 并重放请求队列（并发请求等待队列）
- 支持请求取消（通过 `requestId`）
- 支持请求重试机制
- 统一的响应格式处理与错误提示

---

## 🤝 贡献指南

1. Fork / 克隆仓库
2. 创建分支：`git checkout -b feature/xxx` 或 `fix/xxx`
3. 开发并自测，执行 `npm run typecheck && npm run lint:format && npm run build`
4. 提交：建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)
5. 推送分支并提交 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE)。

---

## 📞 联系我们

📧 **邮箱**: machineswift@qq.com

<div align="center">

**如果本项目对您有帮助，欢迎 ⭐ Star**

Made with ❤️ by Machine Team

</div>