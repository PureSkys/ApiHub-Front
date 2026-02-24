<template>
  <el-container class="h-screen bg-slate-100">
    <el-drawer
      v-if="isMobile"
      v-model="sidebarOpen"
      direction="ltr"
      size="260px"
      :with-header="false"
    >
      <div class="flex flex-col h-full">
        <div class="p-7 border-b border-slate-100">
          <h1 class="text-2xl font-bold text-slate-900 mb-1">ApiHub</h1>
          <p class="text-sm text-slate-500">API 聚合中心</p>
        </div>
        <nav class="flex-1 py-3 overflow-y-auto">
          <el-menu
            :default-active="activeMenu"
            class="border-0"
            router
          >
            <template v-for="route in menuRoutes" :key="route.path">
              <template v-if="!route.children">
                <el-menu-item :index="route.path" @click="sidebarOpen = false">
                  <el-icon><component :is="route.meta?.icon" /></el-icon>
                  <template #title>{{ route.meta?.title }}</template>
                </el-menu-item>
              </template>
              <template v-else>
                <el-sub-menu :index="route.path">
                  <template #title>
                    <el-icon><component :is="route.meta?.icon" /></el-icon>
                    <span>{{ route.meta?.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="child in route.children.filter(c => c.meta?.title)"
                    :key="`${route.path}/${child.path}`"
                    :index="`${route.path}/${child.path}`"
                    @click="sidebarOpen = false"
                  >
                    <el-icon><component :is="child.meta?.icon" /></el-icon>
                    <template #title>{{ child.meta?.title }}</template>
                  </el-menu-item>
                </el-sub-menu>
              </template>
            </template>
          </el-menu>
        </nav>
        <div class="p-4 border-t border-slate-100">
          <span class="text-sm text-slate-400">v0.1.0</span>
        </div>
      </div>
    </el-drawer>

    <aside class="hidden lg:block w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div class="p-7 border-b border-slate-100 shrink-0">
        <h1 class="text-2xl font-bold text-slate-900 mb-1">ApiHub</h1>
        <p class="text-sm text-slate-500">API 聚合中心</p>
      </div>
      <nav class="flex-1 py-3 overflow-y-auto">
        <el-menu
          :default-active="activeMenu"
          :collapse="false"
          class="border-0"
          router
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <template v-if="!route.children">
              <el-menu-item :index="route.path">
                <el-icon><component :is="route.meta?.icon" /></el-icon>
                <template #title>{{ route.meta?.title }}</template>
              </el-menu-item>
            </template>
            <template v-else>
              <el-sub-menu :index="route.path">
                <template #title>
                  <el-icon><component :is="route.meta?.icon" /></el-icon>
                  <span>{{ route.meta?.title }}</span>
                </template>
                <el-menu-item
                  v-for="child in route.children.filter(c => c.meta?.title)"
                  :key="`${route.path}/${child.path}`"
                  :index="`${route.path}/${child.path}`"
                >
                  <el-icon><component :is="child.meta?.icon" /></el-icon>
                  <template #title>{{ child.meta?.title }}</template>
                </el-menu-item>
              </el-sub-menu>
            </template>
          </template>
        </el-menu>
      </nav>
      <div class="p-4 border-t border-slate-100 shrink-0">
        <span class="text-sm text-slate-400">v0.1.0</span>
      </div>
    </aside>

    <el-container class="flex-1 flex flex-col min-w-0">
      <el-header class="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <el-button
            v-if="isMobile"
            @click="sidebarOpen = true"
            :icon="Menu"
            circle
          />
          <span class="text-lg font-semibold text-slate-900">{{ currentTitle }}</span>
        </div>
        <div class="flex items-center gap-4">
          <el-tooltip :content="healthTooltip" placement="bottom" :disabled="!healthData">
            <div
              class="health-status-tag flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300"
              :class="[
                healthStatus === 'loading' ? 'bg-yellow-50 border border-yellow-200' :
                healthStatus === 'healthy' ? 'bg-green-50 border border-green-200' :
                healthStatus === 'warning' ? 'bg-orange-50 border border-orange-200' :
                'bg-red-50 border border-red-200'
              ]"
              @click="handleRetryHealth"
            >
              <span
                class="status-indicator w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
                :class="[
                  healthStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
                  healthStatus === 'healthy' ? 'bg-green-500 animate-pulse' :
                  healthStatus === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                ]"
              ></span>
              <span
                class="status-text text-sm font-medium whitespace-nowrap transition-all duration-300"
                :class="[
                  healthStatus === 'loading' ? 'text-yellow-800' :
                  healthStatus === 'healthy' ? 'text-green-800' :
                  healthStatus === 'warning' ? 'text-orange-800' : 'text-red-800'
                ]"
              >{{ healthStatusText }}</span>
              <el-icon
                v-if="healthStatus === 'error'"
                class="retry-icon text-xs shrink-0 transition-transform duration-300 hover:rotate-180"
                :class="healthStatus === 'error' ? 'text-red-600' : ''"
              ><RefreshLeft /></el-icon>
            </div>
          </el-tooltip>
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-dropdown-trigger flex items-center gap-2 cursor-pointer">
              <el-avatar :size="32" class="user-avatar bg-indigo-100 text-indigo-700 font-semibold">A</el-avatar>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon class="mr-2"><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="flex-1 p-4 lg:p-8 overflow-y-auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Menu, ArrowDown, SwitchButton, RefreshLeft } from '@element-plus/icons-vue'
import { getHealthCheck, type HealthCheckResponse } from '@/api/health'
import { storage } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const isMobile = ref(true)
const sidebarOpen = ref(false)

const healthStatus = ref<'loading' | 'healthy' | 'warning' | 'error'>('loading')
const healthData = ref<HealthCheckResponse | null>(null)
const healthPollingInterval = ref<number | null>(null)
const POLLING_INTERVAL = 30000

const healthStatusText = computed(() => {
  if (healthStatus.value === 'healthy') return '服务正常'
  if (healthStatus.value === 'warning') return '服务警告'
  if (healthStatus.value === 'error') return '服务异常'
  return '检查中...'
})

const healthTooltip = computed(() => {
  if (!healthData.value) return ''
  return `运行时间: ${healthData.value.uptime?.formatted || '未知'}\n检查时间: ${new Date(healthData.value.timestamp).toLocaleString()}`
})

const fetchHealthData = async () => {
  try {
    healthStatus.value = 'loading'
    const response = await getHealthCheck()
    healthData.value = response.data
    if (response.data.status === 'healthy') {
      healthStatus.value = 'healthy'
    } else {
      healthStatus.value = 'warning'
    }
  } catch (error) {
    healthStatus.value = 'error'
  }
}

const handleRetryHealth = () => {
  fetchHealthData()
  if (healthStatus.value === 'error') {
    ElMessage.info('正在重新检查服务状态...')
  }
}

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '仪表盘')

const menuRoutes = computed(() => {
  return router.options.routes.filter(
    (r) => r.meta?.title && r.path !== '/' && r.path !== '/login'
  )
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) sidebarOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchHealthData()
  healthPollingInterval.value = window.setInterval(fetchHealthData, POLLING_INTERVAL)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (healthPollingInterval.value) {
    clearInterval(healthPollingInterval.value)
  }
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      storage.removeToken()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
    }
  }
}
</script>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}

.health-status-tag {
  min-width: fit-content;
}

.user-dropdown-trigger {
  padding: 0.25rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.user-dropdown-trigger:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

:deep(.user-avatar),
:deep(.user-avatar *),
:deep(.el-avatar) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
}

:deep(.user-avatar:hover),
:deep(.user-avatar:focus),
:deep(.user-avatar:focus-visible),
:deep(.user-avatar:focus-within),
:deep(.user-avatar:active),
:deep(.el-avatar:hover),
:deep(.el-avatar:focus),
:deep(.el-avatar:focus-visible),
:deep(.el-avatar:focus-within),
:deep(.el-avatar:active) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
}

:deep(.user-dropdown-trigger:focus),
:deep(.user-dropdown-trigger:focus-visible),
:deep(.user-dropdown-trigger:focus-within) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.user-dropdown),
:deep(.user-dropdown *),
:deep(.el-dropdown) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.user-dropdown:focus),
:deep(.user-dropdown:focus-visible),
:deep(.user-dropdown:focus-within),
:deep(.user-dropdown:hover),
:deep(.user-dropdown:active) {
  outline: none !important;
  box-shadow: none !important;
}

@media (max-width: 640px) {
  .health-status-tag {
    padding: 0.5rem 0.75rem;
  }
  
  .status-text {
    font-size: 0.75rem;
  }
  
  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .health-status-tag {
    padding: 0.5rem 1rem;
  }
  
  .status-text {
    font-size: 0.8125rem;
  }
}

@media (min-width: 1025px) {
  .health-status-tag {
    padding: 0.5rem 1.25rem;
  }
}

:deep(.el-sub-menu__popper) {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

:deep(.el-menu--vertical .el-sub-menu__popper) {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

:deep(.el-menu--popup) {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

:deep(.el-menu) {
  border-right: none !important;
}

:deep(.el-sub-menu .el-menu) {
  background-color: transparent;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
}

aside {
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
}

aside nav {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

aside nav::-webkit-scrollbar {
  width: 6px;
}

aside nav::-webkit-scrollbar-track {
  background: transparent;
}

aside nav::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

aside nav::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>

<style>
.user-avatar,
.user-avatar *,
.el-avatar,
.el-avatar *,
.user-dropdown,
.user-dropdown *,
.el-dropdown,
.el-dropdown * {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

.user-avatar:hover,
.user-avatar:focus,
.user-avatar:focus-visible,
.user-avatar:focus-within,
.user-avatar:active,
.el-avatar:hover,
.el-avatar:focus,
.el-avatar:focus-visible,
.el-avatar:focus-within,
.el-avatar:active,
.user-dropdown:hover,
.user-dropdown:focus,
.user-dropdown:focus-visible,
.user-dropdown:focus-within,
.user-dropdown:active,
.el-dropdown:hover,
.el-dropdown:focus,
.el-dropdown:focus-visible,
.el-dropdown:focus-within,
.el-dropdown:active {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}
</style>
