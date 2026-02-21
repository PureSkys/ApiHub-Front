# API Hub Frontend

一个基于 Vue 3 + TypeScript + Vite 构建的现代化 API 聚合中心前端应用，用于管理和维护句子集数据。

## 项目概述

API Hub Frontend 是一个功能完善的后台管理系统前端项目，提供句子集的完整 CRUD 操作、批量数据处理、数据可视化统计等功能。项目采用现代化前端技术栈，具备响应式设计，支持桌面端和移动端访问。

## 核心功能

### 用户认证
- 邮箱/密码登录
- OAuth2 认证流程
- Token 自动验证与刷新
- 安全的本地存储管理

### 仪表盘
- API 服务健康状态实时监控
- 响应时间统计展示
- 系统版本信息显示
- OpenAPI 文档快捷入口
- 快捷操作导航

### 句子集管理
- **概览统计**：数据可视化图表展示，包括分类分布柱状图、状态饼图
- **分类管理**：分类的增删改查，支持批量删除
- **句子管理**：句子的增删改查，支持多条件筛选、批量操作、JSON 导入

### 批量操作
- 批量删除句子
- 批量启用/禁用状态
- JSON 格式批量导入
- 字段映射与数据验证

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 | ^3.5.25 |
| 开发语言 | TypeScript | ~5.9.3 |
| 构建工具 | Vite | ^8.0.0-beta.13 |
| 路由管理 | Vue Router | ^5.0.2 |
| 状态管理 | Pinia | ^3.0.4 |
| UI 组件库 | Element Plus | ^2.13.2 |
| CSS 框架 | Tailwind CSS | ^3.4.19 |
| HTTP 客户端 | Axios | ^1.13.5 |
| 图表库 | ECharts | ^6.0.0 |
| 图表封装 | vue-echarts | ^8.0.1 |

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0

## 安装与配置

### 克隆项目

```bash
git clone <repository-url>
cd ApiHubFront
```

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 环境配置

项目使用 `.env` 文件进行环境配置：

```env
VITE_APP_TITLE=API Hub
VITE_APP_API_BASE_URL=http://127.0.0.1:8000
```

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | API Hub |
| `VITE_APP_API_BASE_URL` | 后端 API 地址 | http://127.0.0.1:8000 |

### 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

### 预览生产构建

```bash
pnpm preview
# 或
npm run preview
```

## 使用指南

### 登录系统

1. 访问应用根路径，系统会自动跳转到登录页
2. 输入注册的邮箱和密码
3. 点击登录按钮完成认证

### 仪表盘操作

登录成功后自动进入仪表盘页面：
- 查看系统健康状态指示器
- 监控 API 响应时间
- 点击「OpenAPI 文档」查看接口文档
- 使用快捷入口跳转到各功能模块

### 分类管理

1. 通过侧边栏进入「分类管理」
2. 点击「添加分类」创建新分类
3. 在分类列表中可进行编辑或删除操作
4. 支持批量选择并删除多个分类

### 句子管理

1. 通过侧边栏进入「句子管理」
2. 使用筛选卡片按分类、状态或关键词筛选
3. 点击「添加句子」创建新句子
4. 支持批量操作：
   - 选择多个句子后点击「批量删除」
   - 点击「批量启用/禁用」修改状态
   - 点击「批量导入」上传 JSON 文件

### 批量导入格式

JSON 文件格式示例：

```json
[
  {
    "content": "句子内容",
    "translation": "翻译内容",
    "category_id": 1,
    "status": 1
  }
]
```

## API 文档

项目连接后端 API 服务，主要接口如下：

### 认证接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户注册 | POST | `/user/` | 创建新用户 |
| 用户登录 | POST | `/user/token` | OAuth2 密码模式登录 |
| 获取用户信息 | GET | `/user/me` | 获取当前登录用户信息 |

### 分类接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建分类 | POST | `/sentence/category` | 创建新分类 |
| 获取分类列表 | GET | `/sentence/category` | 获取所有分类 |
| 更新分类 | PUT | `/sentence/category/{id}` | 更新指定分类 |
| 删除分类 | DELETE | `/sentence/category/{id}` | 删除指定分类 |

### 句子接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建句子 | POST | `/sentence/` | 创建新句子 |
| 获取句子列表 | GET | `/sentence/{category_id}` | 按分类获取句子 |
| 分页查询句子 | GET | `/sentence/admin/paginated` | 分页获取句子 |
| 获取统计数据 | GET | `/sentence/admin/stats` | 获取句子统计 |
| 更新句子 | PUT | `/sentence/{id}` | 更新指定句子 |
| 删除句子 | DELETE | `/sentence/{id}` | 删除指定句子 |
| 批量删除 | POST | `/sentence/admin/batch/delete` | 批量删除句子 |
| 批量更新状态 | POST | `/sentence/admin/batch/status` | 批量更新状态 |

### 健康检查

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 健康检查 | GET | `/health` | 获取服务健康状态 |

完整 API 文档请访问后端服务的 `/docs` 路径。

## 项目结构

```
ApiHubFront/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API 接口层
│   │   ├── health.ts           # 健康检查 API
│   │   ├── index.ts            # API 客户端配置
│   │   ├── sentence.ts         # 句子相关 API
│   │   └── user.ts             # 用户认证 API
│   ├── assets/                 # 静态资源文件
│   ├── components/             # 公共组件
│   │   ├── Login.vue           # 登录组件
│   │   └── SentenceFilterCard.vue  # 句子筛选卡片
│   ├── layout/                 # 布局组件
│   │   └── index.vue           # 主布局
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── stores/                 # Pinia 状态管理
│   │   └── auth.ts             # 认证状态
│   ├── utils/                  # 工具函数
│   │   └── storage.ts          # 本地存储工具
│   ├── views/                  # 页面视图
│   │   ├── Categories.vue      # 分类管理
│   │   ├── Dashboard.vue       # 仪表盘
│   │   ├── SentenceSetOverview.vue  # 句子集概览
│   │   └── Sentences.vue       # 句子管理
│   ├── App.vue                 # 根组件
│   ├── env.d.ts                # 环境类型声明
│   ├── main.ts                 # 入口文件
│   └── style.css               # 全局样式
├── .env                        # 开发环境变量
├── .env.production             # 生产环境变量
├── index.html                  # HTML 入口
├── package.json                # 项目配置
├── postcss.config.cjs          # PostCSS 配置
├── tailwind.config.cjs         # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
└── vite.config.ts              # Vite 构建配置
```

## 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 遵循 TypeScript 严格模式
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 组件命名采用 PascalCase
- 文件命名采用 PascalCase（组件）或 camelCase（工具函数）
- 保持代码简洁，避免未使用的变量和导入

### 提交规范

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送 Pull Request

---

**API Hub Frontend** - 现代化的句子集管理解决方案
