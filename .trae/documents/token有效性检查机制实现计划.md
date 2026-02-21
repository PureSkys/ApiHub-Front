# Token 有效性检查机制实现计划

## 问题分析

当前项目存在以下问题：
1. 路由守卫只检查 localStorage 中是否存在 token，未验证 token 的实际有效性
2. 页面刷新时，即使 token 已过期，用户仍可访问需要认证的页面
3. 只有在发起 API 请求收到 401 响应时才会被重定向到登录页

## 现有架构

- **认证存储**：`src/utils/storage.ts` - 使用 localStorage 存储 access_token
- **API 客户端**：`src/api/index.ts` - axios 实例，包含请求/响应拦截器
- **用户 API**：`src/api/user.ts` - 包含 `getCurrentUser()` 接口可用于验证 token
- **路由守卫**：`src/router/index.ts` - 当前只检查 token 是否存在

## 实现方案

### 方案选择：应用初始化时验证 Token

在应用启动时（App.vue）进行一次性 token 验证，而非每次路由跳转都验证。这样：
- 只在页面刷新时验证一次
- 减少不必要的 API 调用
- 用户体验更好

### 实现步骤

#### 步骤 1：创建认证状态管理

创建 `src/stores/auth.ts`（使用 Pinia）：
- 管理 `isAuthenticated` 状态
- 管理 `isInitializing` 状态（防止页面闪烁）
- 提供 `verifyToken()` 方法验证 token 有效性
- 提供 `logout()` 方法清除认证状态

#### 步骤 2：在 App.vue 中添加初始化逻辑

修改 `src/App.vue`：
- 在 `onMounted` 生命周期中调用 token 验证
- 验证失败时重定向到登录页
- 显示加载状态直到验证完成

#### 步骤 3：更新路由守卫

修改 `src/router/index.ts`：
- 结合 Pinia store 的认证状态进行判断
- 确保与现有的认证逻辑兼容

#### 步骤 4：更新 API 响应拦截器

修改 `src/api/index.ts`：
- 当收到 401 响应时，同时清除 Pinia store 中的认证状态

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/stores/auth.ts` | 新建 | Pinia 认证状态管理 |
| `src/App.vue` | 修改 | 添加初始化验证逻辑 |
| `src/router/index.ts` | 修改 | 更新路由守卫逻辑 |
| `src/api/index.ts` | 修改 | 更新 401 响应处理 |

## 详细实现

### 1. `src/stores/auth.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { getCurrentUser } from '@/api/user'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isInitializing = ref(true)

  const verifyToken = async () => {
    const token = storage.getToken()
    
    if (!token) {
      isAuthenticated.value = false
      isInitializing.value = false
      return false
    }

    try {
      await getCurrentUser()
      isAuthenticated.value = true
      isInitializing.value = false
      return true
    } catch (error) {
      storage.removeToken()
      isAuthenticated.value = false
      isInitializing.value = false
      return false
    }
  }

  const logout = () => {
    storage.removeToken()
    isAuthenticated.value = false
    router.push('/login')
  }

  const setAuthenticated = (value: boolean) => {
    isAuthenticated.value = value
  }

  return {
    isAuthenticated,
    isInitializing,
    verifyToken,
    logout,
    setAuthenticated
  }
})
```

### 2. `src/App.vue`

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Layout from './layout/index.vue'

const route = useRoute()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.path === '/login')
const isInitializing = computed(() => authStore.isInitializing)

onMounted(async () => {
  const isValid = await authStore.verifyToken()
  if (!isValid && route.meta.requiresAuth !== false) {
    // Token 无效且当前页面需要认证，重定向到登录页
    window.location.href = '/login'
  }
})
</script>

<template>
  <div v-if="isInitializing" class="loading-container">
    <!-- 可选：添加加载动画 -->
    <span>加载中...</span>
  </div>
  <template v-else>
    <Layout v-if="!isLoginPage" />
    <router-view v-else />
  </template>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
```

### 3. `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'

const routes = [
  // ... 保持现有路由配置不变
]

const router = createRouter({
  history: createWebHistory('/apihub'),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'API Hub'}`

  const requiresAuth = to.meta.requiresAuth !== false
  const token = storage.getToken()

  if (requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

### 4. `src/api/index.ts`

```typescript
import axios from 'axios'
import { storage } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'

// ... 其他代码保持不变

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      storage.removeToken()
      // 更新 Pinia store 状态
      const authStore = useAuthStore()
      authStore.setAuthenticated(false)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
```

## 注意事项

1. **循环依赖问题**：`src/api/index.ts` 导入 `auth.ts` store，而 `auth.ts` 导入 `router`。需要在响应拦截器中动态获取 authStore 实例来避免初始化顺序问题。

2. **加载状态**：添加 `isInitializing` 状态防止页面刷新时出现短暂的未认证状态闪烁。

3. **登录成功后**：登录成功后需要调用 `authStore.setAuthenticated(true)` 更新状态。

## 测试要点

1. 页面刷新时，有效 token 应保持登录状态
2. 页面刷新时，无效/过期 token 应重定向到登录页
3. 无 token 时访问受保护页面应重定向到登录页
4. API 返回 401 时应清除状态并重定向
5. 登录成功后应正确设置认证状态
