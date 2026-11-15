<div align="center">

# 🚀 Machine 企业级智能管理平台

![Vue](https://img.shields.io/badge/Vue_3-3.5.42-brightgreen?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.14.5-success?logo=element)
![Vite](https://img.shields.io/badge/Vite-8.3.0-orange?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-4.0.3-yellow?logo=pinia)
![Node.js](https://img.shields.io/badge/Node.js-22.12+-339933?logo=node.js)
[![Project](https://img.shields.io/badge/Project-2026.11.01--RELEASE-blue.svg)](https://gitee.com/machineswift/machine-back-java)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**基于 Vue 3 + TypeScript + Element Plus + Vite + Pinia 企业级智能管理平台 · 与 Machine 后端无缝对接**

 [在线演示](#-在线演示) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [项目结构](#-项目结构)

</div>

---

## 📖 项目简介

**Machine Front Vue** 是 Machine 企业级智能管理平台的统一前端界面，与 [Machine Monolith Java](https://gitee.com/machineswift/machine-monolith-java) 及 [Machine 微服务平台](https://gitee.com/machineswift/machine-back-java) 后端配套使用。采用模块化架构，覆盖权限管理（BIAM）、数据管理、CRM、SCM、流程中心、智能中心、商业智能等企业核心业务，支持动态路由与细粒度权限控制。

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

| 技术                              | 版本      | 说明 |
| ------------------------------- | ------- | ------------------------------------ |
| **Vue 3**                       | 3.5.42  | 渐进式前端框架（Composition API） |
| **TypeScript**                  | 6.0.3   | 类型安全 |
| **Element Plus**                | 2.14.5  | Vue 3 UI 组件库 |
| **Vite**                        | 8.3.0   | 构建工具与开发服务器 |
| **Pinia**                       | 4.0.3   | 状态管理 |
| **pinia-plugin-persistedstate** | 4.7.1   | Pinia 状态持久化 |
| **Vue Router**                  | 5.3.1   | 路由（常量路由 + 动态路由 + 路由守卫 + RouteLookup） |
| **Axios**                       | 1.20.0  | HTTP 请求（含自动刷新 Token、请求取消、请求重试） |
| **Sass**                        | 1.104.1 | CSS 预处理器（modern-compiler API） |
| **CodeMirror 6**                | 6.x     | 代码编辑器核心（JSON / Markdown 语法高亮） |
| **marked**                      | 18.0.13 | Markdown 编译渲染 |
| **DOMPurify**                   | 3.4.15  | Markdown 渲染结果 XSS 净化 |
| **highlight.js**                | 11.12.0 | 代码语法高亮 |
| **mermaid**                     | 12.0.0  | 流程图/图表渲染 |
| **Fuse.js**                     | 7.5.0   | 前端模糊搜索 |
| **pinyin-pro**                  | 3.29.4  | 拼音匹配（全局搜索） |
| **Vue Draggable Plus**          | 0.6.1   | 拖拽组件（标签页、权限范围） |
| **@file-viewer/vue3-full**      | 3.0.3   | 在线文件预览（200+ 格式，配合 vite-plugin） |
| **jschardet**                   | 3.1.4   | 文件编码检测 |
| **Lodash (lodash-es)**          | 4.17.21 | 实用工具库 |
| **NProgress**                   | 0.2.0   | 页面加载进度条 |
| **vue-tsc**                     | 3.3.11  | 类型检查 |
| **@element-plus/icons-vue**     | 2.3.2   | Element Plus 图标库 |
| **vite-plugin-svg-icons**       | 2.0.1   | SVG 图标雪碧图自动注册 |
| **lightningcss**                | 1.33.0  | CSS 编译器（Vite 构建加速） |
| **ESLint**                      | 10.10.0 | 代码规范检查（Flat Config） |
| **Prettier**                    | 3.9.6   | 代码格式化 |
| **Stylelint**                   | 17.15.0 | 样式规范检查 |
| **Husky**                       | 9.1.7   | Git 提交钩子 |
| **Lint-staged**                 | 17.5.1  | 暂存文件 lint 检查 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** 22.12+（Vite 8 / ESLint 10 要求）
- **npm** 10+（仓库已提交 `package-lock.json`，建议以 npm 为唯一包管理器）

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

```text
machine-front-vue/
├── src/
│   ├── layouts/                        # 壳层：后台布局 + 登录页
│   │   ├── admin/                      # 后台布局（侧栏、顶栏、标签页、主内容）
│   │   │   ├── AdminLayout.vue
│   │   │   ├── Redirect.vue
│   │   │   ├── head/                   # 顶栏、标签页
│   │   │   ├── main/                   # 主内容 + KeepAlive
│   │   │   └── slider/                 # Logo、菜单
│   │   └── auth/                       # LoginPage、LoginDialog、OAuth2 回调
│   ├── portal/                         # 官网门户（独立产品线）
│   │   ├── pages/                      # 首页、产品、关于、联系、404
│   │   ├── components/                 # PortalHeader、PortalFooter
│   │   └── composables/                # 门户主题逻辑（样式在 styles/portal）
│   ├── tools/                          # 研发工具（JSON、Markdown、文件预览、JSON 树）
│   ├── modules/                        # 业务模块（按领域拆分）
│   │   ├── home/                       # HomePage、应用中心、程序坞、全局搜索
│   │   ├── biam/                       # 权限域（组织/角色/用户/权限/认证/日志/Webhook）
│   │   ├── data/                       # 品牌、区域、门店、标签、素材、附件、下载
│   │   ├── crm/                        # 客户、会员
│   │   ├── scm/                        # 类目、商品 SKU/SPU/属性
│   │   ├── pce/                        # 流程管理、任务中心、流程运维
│   │   ├── ai/                         # 智能中心
│   │   └── bi/                         # 商业智能看板
│   ├── router/                         # 路由
│   │   ├── index.ts                    # createRouter + installGuards
│   │   ├── guards/                     # auth / title / progress / transition
│   │   ├── modules/                    # 动态路由声明（system/scm/crm/bi/pce/ai）
│   │   └── utils/                      # 路由工具
│   ├── shared/                         # 共享能力
│   │   ├── api/                        # IamGateway、字典等公共接口
│   │   ├── components/                 # QuickSelectHost、SvgIcon、Tree* 等
│   │   ├── composables/                # useEnumOptions、useTreeSearch
│   │   ├── constants/                  # 静态路由、门户、通用、字典枚举
│   │   ├── directives/                 # v-hasPermission（无权限置灰禁用，不隐藏）
│   │   ├── router/                     # getRouter/setRouter 单例持有者
│   │   ├── stores/                     # IamUser（会话）、IamAccess（路由/菜单）、LayoutTab、SystemSetting、DictionaryEnum
│   │   ├── types/                      # 公共类型与摘要 DTO
│   │   └── utils/                      # Request、Permission、TreeData、RouteLookup 等
│   ├── styles/                         # 全局 SCSS（含 styles/portal 门户样式）
│   ├── assets/                         # 图标、图片
│   ├── setting.ts                      # 应用标题、Logo
│   └── main.ts                         # 装配层：pinia、router、Element Plus、指令、错误处理
├── public/                             # 公共静态资源（file-viewer 由插件生成，不入库）
├── index.html                          # 入口 HTML（含首屏 boot 遮罩）
├── vite.config.ts                      # Vite 配置
├── tsconfig.json                       # 单一应用类型检查入口，继承 @vue/tsconfig
├── tsconfig.node.json                  # vite 配置的 Node 侧类型检查
├── eslint.config.js                    # ESLint Flat Config（含 globalIgnores）
├── stylelint.config.mjs                # SCSS 规范（只检查 styles 下的全局样式）
├── .prettierrc.json                    # Prettier 单一配置源，ESLint/IDE 共用
└── package.json
```

### 模块说明

| 模块 | 目录 | 说明 |
| --- | --- | --- |
| **Shared** | `shared/` | 公共组件、组合式函数、请求、权限、状态、类型、常量 |
| **Layouts** | `layouts/` | 后台壳（侧栏/标签页/主内容）与登录壳 |
| **Portal** | `portal/` | 官网门户页面、Header/Footer、主题 |
| **Tools** | `tools/` | JSON、Markdown、文件预览等独立工具 |
| **Home** | `modules/home/` | 应用中心、程序坞、全局搜索 |
| **BIAM** | `modules/biam/` | 组织/角色/用户/权限、认证中心、日志中心、Webhook |
| **Data** | `modules/data/` | 品牌（父子）、区域、门店、标签、素材、附件、下载 |
| **CRM** | `modules/crm/` | 客户、会员 |
| **SCM** | `modules/scm/` | 类目、商品 SKU/SPU/属性 |
| **AI** | `modules/ai/` | 智能中心资源与占位页 |
| **PCE** | `modules/pce/` | 流程管理、任务中心、流程运维 |
| **BI** | `modules/bi/` | 商业智能看板 |

---

## ⚙️ 项目配置

### 环境变量

`.env` 配置接口与环境：

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

  <!-- 无权限时保持占位并置灰禁用，不隐藏 -->
  <button v-hasPermission="'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:EXPORT'">导出用户</button>
</template>
```

> 无权限时指令只切换 `disabled`/`is-disabled`/`aria-disabled` 与指针事件，DOM 结构和布局不变；如需隐藏请显式用 `v-if="has(...)"`。

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
- `/admin/*` — 管理后台（需认证）：`/admin/system`（基础数据 / 权限管理 / 认证中心 / 日志中心 / Webhook / 工作台）、`/admin/scm`、`/admin/crm`、`/admin/bi`、`/admin/pce`、`/admin/ai`（财务 / 人力模块预留）
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

## 🧭 代码约定

新增代码的放置、命名与依赖方向约定。

### 目录职责与依赖方向

| 目录 | 职责 |
| --- | --- |
| `app/` | 唯一装配层：main/bootstrap/插件安装（当前入口仍是 `main.ts`） |
| `layouts/` | 壳层：admin 后台布局、auth 登录壳 |
| `portal/` | 官网门户：页面、Header/Footer、主题 |
| `tools/` | 独立工具页：JSON、Markdown、文件预览 |
| `modules/` | 业务域：iam/data/scm/pce/bi/ai/crm/home |
| `router/` | 路由装配：routes/、guards/、modules/ |
| `shared/` | 跨域通用：api、components、composables、constants、stores、types、utils |
| `styles/` | 全局样式 |

依赖方向：

- `app` → 所有层
- `layouts` → `shared` + `stores`
- `router` → `modules` 的 `routes` + `shared`
- `modules` → `shared` + `modules/iam`
- `portal` / `tools` → `shared`
- `shared` → 仅第三方库与 `shared` 自身

硬规则：`shared` 不 import `@/modules/*` 与 `@/router`；`modules` 之间只允许依赖 `modules/iam`；业务 DTO、业务编辑器组件不要放 `shared`；路由配置放 `router/routes/`，`shared/router/instance.ts` 只持有/注入实例与静态路由表。

### 命名约定

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 页面 | PascalCase，文件名即组件名 | `DataBrand.vue` |
| 弹窗 | 页面名 + 后缀 | `DataBrandAddDialog.vue` / `EditDialog` / `DetailDialog` / `QuickSelectDialog` |
| 通用组件 | PascalCase | `TreePickerPanel.vue` |
| 类型 | `*.type.ts` | `DataShop.type.ts` |
| 工具 | `*.util.ts` | `Request.util.ts` |
| Pinia | `*.store.ts` | `IamAccess.store.ts` |
| 常量 | `*.constant.ts` | `Route.constant.ts` |
| API | `*.api.ts` | `DataBrand.api.ts` |

- 不再新增 `App*` / `Layout*` 泛前缀，壳层用 `AdminLayout.vue`、`LoginDialog.vue` 这类语义名；
- 统一后缀，不混用 `types.ts` / `helper.ts` / `service.ts`；
- 不建目录级 `index.ts` 桶文件，直接深路径 import，避免循环依赖与 tree-shaking 干扰。

### shared 准入

至少两个业务域在用，且不含某个域的业务语义：

- 端口接口放 `shared/api/ports/`（如 `IamGateway.ts`）；
- 具体 HTTP API 放 `shared/api/`（如 `DictionaryEnum.api.ts`）；
- 后端 DTO 镜像最终由 OpenAPI 生成；手写的 `CommonIam` / `AddressInfo` 已分别下沉到 `modules/biam`、`modules/data/shop`，不要再往 `shared/types` 加业务 DTO；
- 请求错误文案映射放 `shared/api/http-error.ts`，不要塞回 `Request.util.ts`。

### 页面与样式

- 页面保持单个 `.vue` 文件，不新增同名 `.ts` / `.scss` sidecar；
- 需要拆分时优先拆子组件（仍是 `.vue`）或 `shared/composables` 的通用组合式；
- 巨页拆分优先删重复模板、抽子组件，而不是把逻辑搬到页面旁的 `.ts`。

### 路由

- 静态路由在 `router/routes/constant.ts`，动态路由在 `router/modules/*.ts`；
- 动态路由不再写 `name` 与 `isDynamic`；`meta.code` 保留为权限码/菜单键；
- 公开页用 `meta.public: true`，不再维护 `PUBLIC_PAGES` 白名单；
- 菜单 `el-menu` 只保留 `router` 模式一种导航，`index` 用真实 `path`。

---

## 🤝 贡献指南

1. Fork / 克隆仓库
2. 创建分支：`git checkout -b feature/xxx` 或 `fix/xxx`
3. 开发并自测，执行 `npm run lint:check && npm run typecheck && npm run build`
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