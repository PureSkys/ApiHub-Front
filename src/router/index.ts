import { createRouter, createWebHashHistory } from 'vue-router'
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
  },
  {
    path: '/school-management',
    name: 'SchoolManagement',
    meta: { title: '学校管理', icon: 'School', requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/school-management/overview'
      },
      {
        path: 'overview',
        name: 'SchoolOverview',
        component: () => import('@/views/school/SchoolOverview.vue'),
        meta: { title: '概览', icon: 'DataAnalysis', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'SchoolUsers',
        component: () => import('@/views/school/SchoolUsers.vue'),
        meta: { title: '用户管理', icon: 'User', requiresAuth: true }
      },
      {
        path: 'schools',
        name: 'Schools',
        component: () => import('@/views/school/Schools.vue'),
        meta: { title: '学校管理', icon: 'OfficeBuilding', requiresAuth: true }
      },
      {
        path: 'classes',
        name: 'SchoolClasses',
        component: () => import('@/views/school/SchoolClasses.vue'),
        meta: { title: '班级管理', icon: 'Grid', requiresAuth: true }
      },
      {
        path: 'students',
        name: 'SchoolStudents',
        component: () => import('@/views/school/SchoolStudents.vue'),
        meta: { title: '学生管理', icon: 'Avatar', requiresAuth: true }
      },
      {
        path: 'exams',
        name: 'SchoolExams',
        component: () => import('@/views/school/SchoolExams.vue'),
        meta: { title: '考试管理', icon: 'EditPen', requiresAuth: true }
      },
      {
        path: 'scores',
        name: 'SchoolScores',
        component: () => import('@/views/school/SchoolScores.vue'),
        meta: { title: '成绩管理', icon: 'TrendCharts', requiresAuth: true }
      },
      {
        path: 'stats',
        name: 'SchoolStats',
        component: () => import('@/views/school/SchoolStats.vue'),
        meta: { title: '统计分析', icon: 'DataLine', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory ('/apihub'),
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
