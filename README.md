<div align="center">

# 🚀 Machine ERP 后台管理系统

![Vue](https://img.shields.io/badge/Vue_3-3.5.28-brightgreen?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.13.2-success?logo=element)
![Vite](https://img.shields.io/badge/Vite-8.0.5-orange?logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**基于 Vue 3 + TypeScript + Element Plus + Vite 的企业级后台管理系统 · 与 Machine 后端无缝对接**

[功能特性](#-功能特性) • [在线演示](#-在线演示) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [项目结构](#-项目结构)

</div>

---

## 📖 项目简介

**Machine Front Vue** 是 Machine 产品线的统一前端界面，与 [Machine Monolith Java](https://gitee.com/machineswift/machine-monolith-java) 及 [Machine 微服务平台](https://gitee.com/machineswift/machine) 后端配套使用。采用模块化架构，覆盖 IAM 权限、数据管理、CRM、SCM、流程中心、商业智能等企业核心业务，支持动态路由与细粒度权限控制。

---

### 🎮 在线演示

> **👉 [http://www.machinerust.cn](http://www.machinerust.cn)**

| 角色    | 账号      | 密码       |
|-------|---------|----------|
| 👤 访客 | `demo`  | `123456` |
| 👤 访客 | `guest` | `123456` |

---

## ✨ 功能特性

### 🔐 权限系统 (IAM)
- **组织管理**：多级组织架构维护
- **角色管理**：RBAC 角色与数据权限配置
- **用户管理**：用户维护、组织/角色关联
- **菜单管理**：动态菜单、按钮级权限、数据权限
- **权限指令**：`v-hasPermission` 指令与 `PermissionUtil` 工具类
- **登录日志**：登录记录审计

### 📊 数据管理 (Data)
- **基础数据**：品牌、区域、门店、供应商等
- **素材管理**：图片/文件素材上传、分类、分页筛选
- **标签系统**：多级标签维护与选择器
- **下载中心**：导出任务管理与文件下载

### 👥 客户关系管理 (CRM)
- **客户管理**：客户信息维护
- **会员管理**：会员等级与权益

### 📦 供应链 (SCM)
- **商品管理**：商品信息维护
- **类目管理**：商品类目枚举与扩展

### ⚙️ 流程中心 (PCE)
- **流程管理**：流程设计、建模、部署、模板管理
- **任务中心**：待办、已办、发起、抄送任务
- **运维监控**：流程实例监控、异常处理、运行历史

### 📈 商业智能 (BI)
- **数据看板**：可视化仪表盘

### 🛠️ 工程化
- **响应式布局**：多端适配，标签页、侧栏、主题可配置
- **TypeScript**：全量类型安全
- **ESLint + Prettier + Stylelint + Husky**：代码规范与质量保障

---

## 🔧 技术栈

| 技术                     | 版本      | 说明                       |
|------------------------|---------|--------------------------|
| **Vue 3**              | 3.5.28  | 渐进式前端框架（Composition API） |
| **TypeScript**         | 5.8.3   | 类型安全                     |
| **Element Plus**       | 2.13.2  | Vue 3 UI 组件库             |
| **Vite**               | 8.0.5   | 构建工具与开发服务器               |
| **Pinia**              | 3.0.4   | 状态管理（含持久化插件）             |
| **Vue Router**         | 4.5.2   | 路由（常量路由 + 动态路由）          |
| **Axios**              | 1.15.0  | HTTP 请求                  |
| **Sass**               | 1.89.1  | CSS 预处理器                 |
| **Vue Draggable Plus** | 0.6.1   | 拖拽组件                     |
| **Fuse.js**            | 7.1.0   | 前端模糊搜索                   |
| **Matter.js**          | 0.20.0  | 物理引擎（页面特效）               |
| **NProgress**          | 0.2.0   | 页面加载进度条                  |
| **ESLint + Prettier**  | —       | 代码规范                     |
| **Stylelint**          | 16.20.0 | 样式规范                     |
| **Husky**              | 9.1.7   | Git 提交钩子                 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** 18+
- **npm** 9+ / **yarn** 1.22+ / **pnpm** 7+

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
```

### 代码规范

```bash
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
│   ├── modules/                       # 业务模块（按领域拆分）
│   │   ├── common/                    # 公共组件、工具、stores、类型
│   │   ├── iam/                       # 权限（组织、角色、用户、菜单、登录日志）
│   │   ├── data/                      # 数据（品牌、区域、门店、标签、素材、下载）
│   │   ├── crm/                       # 客户与会员管理
│   │   ├── scm/                       # 供应链（商品、类目）
│   │   ├── pce/                       # 流程中心（流程管理、任务中心、运维监控）
│   │   └── bi/                        # 商业智能（数据看板）
│   ├── views/                         # 布局、登录、回调等页面
│   ├── router/                        # 路由（常量路由 + 动态路由 + 守卫）
│   │   └── modules/                   # 各模块路由配置
│   ├── styles/                        # 全局样式与变量
│   ├── assets/                        # 静态资源（图标等）
│   ├── setting.ts                     # 应用标题、Logo 等配置
│   └── main.ts                        # 应用入口
├── public/
├── .env.development                   # 开发环境变量
├── .env.test                          # 测试环境变量
├── .env.production                    # 生产环境变量
├── vite.config.ts                     # Vite 配置
├── tsconfig.json                      # TypeScript 配置
└── package.json
```

### 模块说明

| 模块         | 目录                | 说明                       |
|------------|-------------------|--------------------------|
| **Common** | `modules/common/` | 公共组件、指令、工具类、状态管理、类型定义    |
| **IAM**    | `modules/iam/`    | 组织/角色/用户/菜单管理、登录日志、权限指令  |
| **Data**   | `modules/data/`   | 品牌、区域、门店、标签、素材、下载中心      |
| **CRM**    | `modules/crm/`    | 客户信息、会员等级与权益             |
| **SCM**    | `modules/scm/`    | 商品管理、类目枚举                |
| **PCE**    | `modules/pce/`    | 流程管理（设计/建模/部署）、任务中心、运维监控 |
| **BI**     | `modules/bi/`     | 商业智能仪表盘                  |

---

## ⚙️ 项目配置

### 环境变量

`.env.development` / `.env.test` / `.env.production` 配置接口与环境：

```env
VITE_API_BASE_URL=/machine-gateway-server/
VITE_SERVER_DEV=http://localhost:8080
VITE_SERVER_TEST=http://localhost:8080
VITE_SERVER_PROD=https://www.machine.com
```

### 应用设置

标题、Logo 等见 **`src/setting.ts`**，按需修改即可。

---

## 🔐 权限系统

### 权限指令

```vue
<template>
  <!-- 单个权限 -->
  <button v-hasPermission="'user:create'">创建用户</button>

  <!-- 多权限满足其一 -->
  <button v-hasPermission="['user:create', 'user:edit']">创建/编辑</button>

  <!-- 无权限时的自定义提示 -->
  <button v-hasPermission:删除="'user:delete'">删除用户</button>
</template>
```

### 路由权限

- **常量路由**：登录、404 等固定页面
- **动态路由**：根据用户权限从后端拉取并注册，保证仅可访问有权限的菜单与页面

权限工具类 `PermissionUtil` 提供权限校验、列表获取等能力，可与指令、路由配合使用。

---

## 🤝 贡献指南

1. Fork / 克隆仓库
2. 创建分支：`git checkout -b feature/xxx` 或 `fix/xxx`
3. 开发并自测，执行 `npm run lint:format`、`npm run build:production`
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


---

## 📸 项目截图

<details open>
<summary>点击查看系统截图</summary>

|                                                                                          |                                                                                                    |
|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| ![用户管理](https://foruda.gitee.com/images/1783071255266439467/627a373b_1743170.png "用户管理") | ![用户管理-修改权限](https://foruda.gitee.com/images/1783071375688212183/8dbe897c_1743170.png "用户管理-修改权限") |
| ![角色管理](https://foruda.gitee.com/images/1783071406649174816/ca8ed193_1743170.png "角色管理") | ![角色管理-修改权限](https://foruda.gitee.com/images/1783071437469611879/e67c66e1_1743170.png "角色管理-修改权限") |
| ![菜单管理](https://foruda.gitee.com/images/1783071480771236589/37f62d84_1743170.png "菜单管理") | ![组织管理](https://foruda.gitee.com/images/1783071513353129060/2b11feee_1743170.png "组织管理")           |
| ![登录日志](https://foruda.gitee.com/images/1783071552211755732/ca25b949_1743170.png "登录日志") | ![下载中心](https://foruda.gitee.com/images/1783071579994660127/5274a76f_1743170.png "下载中心")           |
| ![标签管理](https://foruda.gitee.com/images/1783071601077849100/667fb97f_1743170.png "标签管理") | ![素材管理](https://foruda.gitee.com/images/1783071624694220995/3ce62c5b_1743170.png "素材管理")           |
| ![区域管理](https://foruda.gitee.com/images/1783071648872371665/5db76153_1743170.png "区域管理") |                                                                                                    |


</details>

---