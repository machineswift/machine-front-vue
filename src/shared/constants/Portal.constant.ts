/** 导航栏工具分类菜单 */
export interface ToolItem {
  path: string
  label: string
  desc: string
  icon: string
  cardIcon: string
  tags: string[]
}

export interface ToolCategory {
  key: string
  label: string
  icon: string
  tools: ToolItem[]
}

export const toolCategories: ToolCategory[] = [
  {
    key: 'text',
    label: '文本工具',
    icon: '📝',
    tools: [
      {
        path: '/website/tools/markdown-editor',
        label: 'Markdown 编辑器',
        desc: '所见即所得的 Markdown 编辑器，支持实时预览、代码高亮和多种主题',
        icon: '📝',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><path d="M9 17h6"/><path d="M9 13h6"/><path d="M9 9h2"/></svg>',
        tags: ['文本', '编辑器']
      },
      {
        path: '/website/tools/json-formatter',
        label: 'JSON 格式化',
        desc: '在线美化和压缩 JSON 数据，支持语法高亮、树形展开、BigInt、排序、转义、编辑和下载',
        icon: '📋',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M12 22V12"/><path d="M9 10l3-2 3 2"/></svg>',
        tags: ['JSON', '格式化', '树形']
      }
    ]
  },
  {
    key: 'file',
    label: '文件工具',
    icon: '📁',
    tools: [
      {
        path: '/website/tools/file-preview',
        label: '文件预览',
        desc: '在线预览 PDF、Word、Excel、图片、音视频等 200+ 文件格式，支持粘贴链接和本地上传',
        icon: '📁',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        tags: ['预览', '文件']
      }
    ]
  },
  {
    key: 'time',
    label: '时间工具',
    icon: '⏰',
    tools: [
      {
        path: '/website/tools/timestamp',
        label: '时间戳转换',
        desc: '时间戳与日期时间相互转换，支持秒级和毫秒级（规划中）',
        icon: '⏰',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        tags: ['时间']
      }
    ]
  },
  {
    key: 'code',
    label: '代码生成',
    icon: '💻',
    tools: [
      {
        path: '/website/tools/base64',
        label: 'Base64 编解码',
        desc: 'Base64 编码解码工具，支持字符串和文件（规划中）',
        icon: '💻',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        tags: ['编码/解码']
      }
    ]
  },
  {
    key: 'crypto',
    label: '加密工具',
    icon: '🔒',
    tools: [
      {
        path: '/website/tools/md5',
        label: 'MD5 加密',
        desc: 'MD5 哈希算法加密，支持字符串和文件（规划中）',
        icon: '🔒',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
        tags: ['Hash', '加密/解密']
      }
    ]
  },
  {
    key: 'network',
    label: '网络工具',
    icon: '🌐',
    tools: [
      {
        path: '/website/tools/ip',
        label: 'IP 归属地查询',
        desc: '查询 IPv4/IPv6 地址的详细信息（规划中）',
        icon: '🌐',
        cardIcon:
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
        tags: ['网络']
      }
    ]
  }
]

/** 产品特性分类 */
export const featureCategories = [
  { key: 'all', label: '全部' },
  { key: 'market', label: '营销与服务' },
  { key: 'supply', label: '供应与生产' },
  { key: 'manage', label: '管理与协同' },
  { key: 'intel', label: '数据与智能' }
]

/** 功能模块列表 */
export const features = [
  {
    code: 'HRM',
    title: '人力资源 HRM',
    desc: '组织架构、员工档案、岗位管理一体化，支持对接北森等第三方 HR SaaS。',
    icon: 'el-icon-UserFilled',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    category: 'manage',
    services: ['hrm-service', 'hrm-client', 'beisen-sdk']
  },
  {
    code: 'CHANNEL',
    title: '渠道与内容',
    desc: '微信、飞书、华为云等多渠道集成，配合文档素材管理，实现营销内容统一分发。',
    icon: 'el-icon-Promotion',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    category: 'market',
    services: ['tpp-service', 'doc-service', 'wechat-starter']
  },
  {
    code: 'CRM',
    title: '客户管理 CRM',
    desc: '全生命周期客户管理，销售漏斗、工单系统、合同管理一体化。',
    icon: 'el-icon-User',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    category: 'market',
    services: ['crm-service', 'crm-client']
  },
  {
    code: 'SCM',
    title: '供应链管理 SCM',
    desc: '采购、库存、类目、属性、商品 SKU/SPU 全链路数字化管理。',
    icon: 'el-icon-Van',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    category: 'supply',
    services: ['scm-service', 'scm-client']
  },
  {
    code: 'MFG',
    title: '生产管理 MFG',
    desc: '生产计划排程、工单管理、质检追溯、产能分析（规划中）。',
    icon: 'el-icon-Setting',
    gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    category: 'supply',
    services: ['规划中']
  },
  {
    code: 'PM',
    title: '项目管理 PM',
    desc: '项目立项、任务分解、甘特图、资源管理（规划中）。',
    icon: 'el-icon-List',
    gradient: 'linear-gradient(135deg, #fddb92, #d1fdff)',
    category: 'supply',
    services: ['规划中']
  },
  {
    code: 'FM',
    title: '财务管理 FM',
    desc: '应收应付、费用报销、发票管理、财务报表（规划中）。',
    icon: 'el-icon-Money',
    gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
    category: 'manage',
    services: ['规划中']
  },
  {
    code: 'BI',
    title: '商业智能 BI',
    desc: '多源数据采集、分析，可视化大屏助力管理决策，数据驱动增长。',
    icon: 'el-icon-DataAnalysis',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    category: 'intel',
    services: ['data-service', 'bi-module']
  },
  {
    code: 'BPM',
    title: '流程中心',
    desc: '基于 Camunda BPM 引擎，支持 BPMN 2.0 流程设计、审批流转、工单任务分配。',
    icon: 'el-icon-Connection',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    category: 'market',
    services: ['camunda-server']
  },
  {
    code: 'AI',
    title: '智能中心 AI',
    desc: '集成大语言模型，支持智能问答、文档分析、流程自动化。',
    icon: 'el-icon-MagicStick',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    category: 'intel',
    services: ['ai-service', 'ai-client', 'ai-starter']
  },
  {
    code: 'DATA',
    title: '数据中台',
    desc: '主数据管理（门店、加盟商、供应商等），文件中心、消息中心统一管理。',
    icon: 'el-icon-DataLine',
    gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)',
    category: 'supply',
    services: ['data-service', 'data-client']
  },
  {
    code: 'IAM',
    title: '权限与安全 IAM',
    desc: 'RBAC 权限模型、OAuth2 认证、按钮级细粒度权限、操作审计日志全覆盖。',
    icon: 'el-icon-Lock',
    gradient: 'linear-gradient(135deg, #c471ed, #f64f59)',
    category: 'manage',
    services: ['iam-service', 'iam-app', 'security-starter']
  }
]
