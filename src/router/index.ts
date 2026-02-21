import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘', icon: 'Monitor', requiresAuth: true }
  },
  {
    path: '/sentence-set',
    name: 'SentenceSet',
    meta: { title: '句子集', icon: 'Collection', requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/sentence-set/overview'
      },
      {
        path: 'overview',
        name: 'SentenceSetOverview',
        component: () => import('@/views/SentenceSetOverview.vue'),
        meta: { title: '概览', icon: 'TrendCharts', requiresAuth: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '分类管理', icon: 'PriceTag', requiresAuth: true }
      },
      {
        path: 'sentences',
        name: 'Sentences',
        component: () => import('@/views/Sentences.vue'),
        meta: { title: '句子管理', icon: 'Document', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/apihub'),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'API Hub'}`

  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false
  const token = storage.getToken()

  if (requiresAuth && !token) {
    // 关键修改：用 resolve 自动拼接二级路径
    const loginPath = router.resolve('/login').fullPath
    next(loginPath) // 比如二级路径是 /api-hub，这里会变成 /api-hub/login
  } else if (to.path === '/login' && token) {
    // 关键修改：自动拼接 dashboard 的路径
    const dashboardPath = router.resolve('/dashboard').fullPath
    next(dashboardPath) // 比如变成 /api-hub/dashboard
  } else {
    next()
  }
})

export default router
