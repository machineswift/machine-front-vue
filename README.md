# Machine ERP 后台管理系统

![Vue](https://img.shields.io/badge/Vue-3.5.13-brightgreen)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)  
![Element Plus](https://img.shields.io/badge/Element_Plus-2.10.2-success)  
![Vite](https://img.shields.io/badge/Vite-6.3.5-orange)

## 项目介绍
Machine Front Vue 是一个基于 Vue 3 和 TypeScript 构建的 ERP 后台管理系统。该项目旨在为企业提供一套高效、稳定且易于扩展的管理界面，涵盖用户权限管理、数据可视化、业务流程控制等多个方面。

## 功能特性
- **完善的权限系统**：支持角色和用户权限的精细控制。
- **数据可视化**：提供直观的图表展示，帮助用户快速理解数据。
- **模块化设计**：系统由多个独立模块组成，便于维护和扩展。
- **响应式布局**：适配不同屏幕尺寸，确保良好的用户体验。
- **API 集成**：与后端服务无缝对接，实现高效的数据交互。
- 
## 技术栈
| 技术           | 版本     | 描述                                |
|--------------|--------|-----------------------------------|
| Vue3         | 3.5.13 | 构建用户界面的渐进式 JavaScript 框架          |
| TypeScript   | 5.8.3  | 为 JavaScript 添加静态类型检查，提高代码质量和可维护性 |
| Element Plus | 2.10.2 | 基于 Vue 3 的组件库，提供丰富的 UI 组件         |
| Vite         | 6.3.5  | 新一代前端构建工具，提供更快的冷启动速度和热更新          |

## 项目结构
```bash
machine-front-vue/
├── src/
│   ├── modules/          # 业务模块
│   │   ├── iam/          # 权限管理模块
│   │   ├── scm/          # 供应链管理模块
│   │   ├── system/       # 系统管理模块
│   │   └── ...           # 其他业务模块
│   ├── views/            # 页面视图
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   └── main.ts           # 应用入口
├── public/               # 静态资源
├── .env.*                # 环境变量配置
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+ 或 pnpm 7+

### 安装依赖
```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 开发模式
```bash
npm run dev
```

### 构建命令
```bash
# 开发环境构建
npm run build

# 测试环境构建
npm run build:test

# 生产环境构建
npm run build:production
```

# 项目配置
## 环境变量
项目使用 `.env` 文件来配置环境变量。以下是一个示例配置：
```env
# .env 示例配置
VITE_API_BASE_URL=/machine-gateway-server/
VITE_SERVER_DEV=http://localhost:8080
VITE_SERVER_TEST=http://localhost:8080
VITE_SERVER_PROD=https://www.machine.com
```

## 应用设置
应用的主要配置位于 `src/setting.ts` 文件中，您可以根据需要调整相关参数。

# 权限系统
## 权限指令使用
```vue
<template>
  <!-- 单个权限检查 -->
  <button v-hasPermission="'user:create'">创建用户</button>

  <!-- 多个权限检查(满足其一即可) -->
  <button v-hasPermission="['user:create', 'user:edit']">创建/编辑用户</button>

  <!-- 自定义提示文本 -->
  <button v-hasPermission:删除="'user:delete'">删除用户</button>
</template>
```
## 权限工具类
权限工具类 `PermissionUtil` 提供了多种方法来处理权限相关的逻辑，如检查权限、获取权限列表等。

### 路由配置
#### 常量路由
常量路由定义了系统中的固定页面，如登录页、404 页面等。

#### 动态路由
动态路由根据用户的权限动态生成，确保用户只能访问其有权限的页面。

# 贡献指南
## 开发流程
1. 克隆仓库：`git clone https://gitee.com/your-repo/machine-front-vue.git`
2. 创建分支：`git checkout -b feature/your-feature-name`
3. 编写代码并测试
4. 提交更改：`git commit -m "feat: add your feature"`
5. 推送分支：`git push origin feature/your-feature-name`
6. 创建 Pull Request

### 提交规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，确保提交信息清晰易懂。

## 许可证
本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 项目截图
<details open>
<summary>📸 点击查看系统截图</summary>

|                                                                                                                  |                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| ![组织管理](https://foruda.gitee.com/images/1752058152308168389/26765971_1743170.png "组织管理")                         | ![菜单管理](https://foruda.gitee.com/images/1752058213971604725/94047b91_1743170.png "菜单管理")                                       |
| ![菜单管理->菜单数据权限](https://foruda.gitee.com/images/1752058232898946634/fce0c6b3_1743170.png "菜单管理->菜单数据权限")         | ![角色管理](https://foruda.gitee.com/images/1752058297136950343/5bebe122_1743170.png "角色管理")                                       |
| ![角色管理->快速选择用户查询条件](https://foruda.gitee.com/images/1752058309648309405/69cebc27_1743170.png "角色管理->快速选择用户查询条件") | ![角色管理->修改角色和菜单关系->菜单数据权限](https://foruda.gitee.com/images/1752058380433604267/044d7bab_1743170.png "角色管理->修改角色和菜单关系->菜单数据权限") |
| ![用户管理](https://foruda.gitee.com/images/1752058443585482667/491fd83b_1743170.png "用户管理")                         | ![用户管理->修改用户组织关系](https://foruda.gitee.com/images/1752058453823721542/ed931893_1743170.png "用户管理->修改用户组织关系")                   |
| ![用户管理->修改用户角色关系](https://foruda.gitee.com/images/1752058464331842324/4890d98a_1743170.png "用户管理->修改用户角色关系")     | ![登录日志](https://foruda.gitee.com/images/1752058558558878384/62ffa1ba_1743170.png "登录日志")                                       |
| ![品牌管理](https://foruda.gitee.com/images/1752058585804366702/a247c7c8_1743170.png "品牌管理")                         | ![区域管理](https://foruda.gitee.com/images/1752058594701167020/05e08d1e_1743170.png "区域管理")                                       |
| ![门店管理](https://foruda.gitee.com/images/1752058606109602572/a3031fd2_1743170.png "门店管理")                         |                                                                                                                                |
</details>