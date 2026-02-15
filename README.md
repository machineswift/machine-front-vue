# Machine ERP 后台管理系统

![Vue](https://img.shields.io/badge/Vue-3.5.28-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.13.2-success)
![Vite](https://img.shields.io/badge/Vite-6.4.1-orange)

基于 Vue 3 + TypeScript + Element Plus + Vite 的 ERP 后台管理系统，提供权限管理、数据管理、CRM 等模块，支持响应式布局与动态路由。

---

## 功能特性

- **权限系统**：组织、角色、用户、菜单/权限管理，支持数据权限与指令 `v-hasPermission`
- **业务模块**：IAM 权限、数据（品牌/区域/门店/标签/素材/下载）、CRM 客户与会员等
- **模块化设计**：按业务拆分 `modules`，便于维护与扩展
- **响应式布局**：多端适配，标签页、侧栏、主题可配置
- **工程化**：TypeScript、ESLint、Prettier、Stylelint、Husky

---

## 技术栈

| 技术           | 版本    | 说明                     |
|----------------|---------|--------------------------|
| Vue 3          | 3.5.x   | 渐进式前端框架           |
| TypeScript     | 5.8.x   | 类型安全与可维护性       |
| Element Plus   | 2.13.x  | Vue 3 UI 组件库          |
| Vite           | 6.4.x   | 构建与开发服务器         |
| Pinia          | 3.0.x   | 状态管理                 |
| Vue Router     | 4.5.x   | 路由（含动态路由）       |
| Axios          | 1.13.x  | HTTP 请求                |
| Sass           | 1.89.x  | 样式预处理               |

---

## 项目结构

```
machine-front-vue/
├── src/
│   ├── modules/           # 业务模块
│   │   ├── common/        # 公共组件、工具、stores、类型
│   │   ├── iam/           # 权限（组织、角色、用户、菜单、登录日志）
│   │   ├── data/          # 数据（品牌、区域、门店、标签、素材、下载）
│   │   ├── crm/           # 客户与会员
│   │   └── ...
│   ├── views/             # 布局、登录、回调等页面
│   ├── router/            # 路由与守卫
│   ├── styles/            # 全局样式与变量
│   ├── setting.ts         # 应用标题、Logo 等配置
│   └── main.ts            # 应用入口
├── public/
├── .env.*                  # 环境变量
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 快速开始

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
# 开发环境构建
npm run build

# 测试环境构建
npm run build:test

# 生产环境构建（含类型检查）
npm run build:production

# 本地预览构建产物
npm run preview
```

### 代码规范

```bash
# 检查 ESLint
npm run lint:check

# 自动修复 ESLint
npm run lint:format
```

---

## 项目配置

### 环境变量

通过 `.env`、`.env.development`、`.env.test`、`.env.production` 配置接口与环境：

```env
# 示例
VITE_API_BASE_URL=/machine-gateway-server/
VITE_SERVER_DEV=http://localhost:8080
VITE_SERVER_TEST=http://localhost:8080
VITE_SERVER_PROD=https://www.machine.com
```

### 应用设置

标题、Logo 等见 **`src/setting.ts`**，按需修改即可。

---

## 权限系统

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

### 路由

- **常量路由**：登录、404 等固定页面
- **动态路由**：根据用户权限从后端拉取并注册，保证仅可访问有权限的菜单与页面

权限工具类 `PermissionUtil` 提供权限校验、列表获取等能力，可与指令、路由配合使用。

---

## 贡献指南

1. Fork / 克隆仓库
2. 创建分支：`git checkout -b feature/xxx` 或 `fix/xxx`
3. 开发并自测，执行 `npm run lint:format`、`npm run build:production`
4. 提交：建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)
5. 推送分支并提交 Pull Request

---

## 许可证

MIT，详见 [LICENSE](LICENSE)。

---

## 项目截图

<details open>
<summary>📸 点击查看系统截图</summary>

| | |
|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| ![组织管理](https://foruda.gitee.com/images/1752058152308168389/26765971_1743170.png "组织管理") | ![菜单管理](https://foruda.gitee.com/images/1752058213971604725/94047b91_1743170.png "菜单管理") |
| ![菜单管理->菜单数据权限](https://foruda.gitee.com/images/1752058232898946634/fce0c6b3_1743170.png "菜单管理->菜单数据权限") | ![角色管理](https://foruda.gitee.com/images/1752058297136950343/5bebe122_1743170.png "角色管理") |
| ![角色管理->快速选择用户查询条件](https://foruda.gitee.com/images/1752058309648309405/69cebc27_1743170.png "角色管理->快速选择用户查询条件") | ![角色管理->修改角色和菜单关系->菜单数据权限](https://foruda.gitee.com/images/1752058380433604267/044d7bab_1743170.png "角色管理->修改角色和菜单关系->菜单数据权限") |
| ![用户管理](https://foruda.gitee.com/images/1752058443585482667/491fd83b_1743170.png "用户管理") | ![用户管理->修改用户组织关系](https://foruda.gitee.com/images/1752058453823721542/ed931893_1743170.png "用户管理->修改用户组织关系") |
| ![用户管理->修改用户角色关系](https://foruda.gitee.com/images/1752058464331842324/4890d98a_1743170.png "用户管理->修改用户角色关系") | ![登录日志](https://foruda.gitee.com/images/1752058558558878384/62ffa1ba_1743170.png "登录日志") |
| ![品牌管理](https://foruda.gitee.com/images/1752058585804366702/a247c7c8_1743170.png "品牌管理") | ![区域管理](https://foruda.gitee.com/images/1752058594701167020/05e08d1e_1743170.png "区域管理") |
| ![门店管理](https://foruda.gitee.com/images/1752058606109602572/a3031fd2_1743170.png "门店管理") | |

</details>
