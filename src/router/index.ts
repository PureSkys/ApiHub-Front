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
  history: createWebHistory(),
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
    // 需要登录但没有token，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，重定向到首页
    next('/dashboard')
  } else {
    next()
  }
})

export default router
