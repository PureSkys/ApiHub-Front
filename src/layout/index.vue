<template>
  <el-container class="flex h-screen bg-slate-100">
    <el-drawer
      v-model="sidebarOpen"
      direction="ltr"
      size="260px"
      :with-header="false"
      class="lg:hidden"
    >
      <div class="flex flex-col h-full">
        <div class="p-7 border-b border-slate-100">
          <h1 class="text-2xl font-bold text-slate-900 mb-1">ApiHub</h1>
          <p class="text-sm text-slate-500">API 聚合中心</p>
        </div>
        <nav class="flex-1 py-3">
          <template v-for="route in menuRoutes" :key="route.path">
            <template v-if="!route.children">
              <router-link
                :to="route.path"
                class="flex items-center gap-3 mx-4 my-1 px-4 py-3 rounded-lg transition-colors"
                :class="
                  activeMenu.startsWith(route.path)
                    ? 'bg-blue-50 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100'
                "
                @click="sidebarOpen = false"
              >
                <el-icon>
                  <component :is="route.meta?.icon" />
                </el-icon>
                <span>{{ route.meta?.title }}</span>
              </router-link>
            </template>
            <template v-else>
              <el-sub-menu :index="route.path">
                <template #title>
                  <el-icon><component :is="route.meta?.icon" /></el-icon>
                  <span>{{ route.meta?.title }}</span>
                </template>
                <router-link
                  v-for="child in route.children.filter(c => c.meta?.title)"
                  :key="child.path"
                  :to="`${route.path}/${child.path}`"
                  class="flex items-center gap-3 mx-2 my-1 px-4 py-2 rounded-lg transition-colors"
                  :class="
                    activeMenu === `${route.path}/${child.path}`
                      ? 'bg-blue-50 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100'
                  "
                  @click="sidebarOpen = false"
                >
                  <el-icon><component :is="child.meta?.icon" /></el-icon>
                  <span>{{ child.meta?.title }}</span>
                </router-link>
              </el-sub-menu>
            </template>
          </template>
        </nav>
        <div class="p-4 border-t border-slate-100">
          <span class="text-sm text-slate-400">v0.1.0</span>
        </div>
      </div>
    </el-drawer>

    <aside class="hidden lg:block w-64 bg-white border-r border-slate-200 flex flex-col">
      <div class="p-7 border-b border-slate-100">
        <h1 class="text-2xl font-bold text-slate-900 mb-1">ApiHub</h1>
        <p class="text-sm text-slate-500">API 聚合中心</p>
      </div>
      <nav class="flex-1 py-3">
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
      <div class="p-4 border-t border-slate-100">
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
          <el-tag type="success" effect="light" class="rounded-full">
            <span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
            后端服务正常
          </el-tag>
          <el-dropdown @command="handleCommand">
            <span class="flex items-center gap-2 cursor-pointer">
              <el-avatar :size="32" class="bg-indigo-100 text-indigo-700 font-semibold">A</el-avatar>
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
import { Menu, ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isMobile = ref(false)
const sidebarOpen = ref(false)

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
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      localStorage.removeItem('apihub_access_token')
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
    }
  }
}
</script>
