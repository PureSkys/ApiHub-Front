<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">API 健康状态</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <p class="text-2xl font-bold text-slate-900">正常</p>
            </div>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <el-icon class="text-green-600 text-2xl"><Connection /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">响应时间</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">&lt; 100ms</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon class="text-blue-600 text-2xl"><Timer /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">系统版本</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">v0.1.0</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <el-icon class="text-purple-600 text-2xl"><Box /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">运行时间</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ uptime }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <el-icon class="text-orange-600 text-2xl"><Clock /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">系统信息</span>
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <el-icon class="text-blue-600"><Platform /></el-icon>
              </div>
              <span class="text-sm text-slate-500">后端服务</span>
            </div>
            <el-tag type="success" effect="dark">在线</el-tag>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <el-icon class="text-green-600"><Link /></el-icon>
              </div>
              <span class="text-sm text-slate-500">API 地址</span>
            </div>
            <el-tag type="info" size="small">http://127.0.0.1:8000</el-tag>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <el-icon class="text-purple-600"><Document /></el-icon>
              </div>
              <span class="text-sm text-slate-500">前端框架</span>
            </div>
            <span class="text-sm font-medium text-slate-900">Vue 3 + TypeScript</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <el-icon class="text-orange-600"><Tools /></el-icon>
              </div>
              <span class="text-sm text-slate-500">UI 组件库</span>
            </div>
            <span class="text-sm font-medium text-slate-900">Element Plus</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">API 文档</span>
          </div>
        </template>
        <div class="space-y-4">
          <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <el-icon class="text-white text-2xl"><Reading /></el-icon>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-slate-900 mb-1">OpenAPI 文档</h3>
                <p class="text-sm text-slate-600 mb-3">完整的 API 接口文档，包含所有接口的请求和响应格式</p>
                <el-link type="primary" href="http://127.0.0.1:8000/docs" target="_blank">
                  <el-icon class="mr-1"><Top /></el-icon>
                  访问文档
                </el-link>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="p-4 bg-slate-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <el-icon class="text-green-600"><SuccessFilled /></el-icon>
                </div>
                <div>
                  <p class="text-xs text-slate-500">接口总数</p>
                  <p class="text-lg font-bold text-slate-900">8+</p>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-slate-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <el-icon class="text-orange-600"><Setting /></el-icon>
                </div>
                <div>
                  <p class="text-xs text-slate-500">数据模型</p>
                  <p class="text-lg font-bold text-slate-900">4+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">快捷操作</span>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          @click="goToSentenceSet"
          class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><Collection /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">句子集</h3>
              <p class="text-sm text-slate-500">管理句子和分类</p>
            </div>
          </div>
        </div>
        
        <div
          @click="goToCategories"
          class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><PriceTag /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">分类管理</h3>
              <p class="text-sm text-slate-500">添加和编辑分类</p>
            </div>
          </div>
        </div>
        
        <div
          @click="goToSentences"
          class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><Document /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">句子管理</h3>
              <p class="text-sm text-slate-500">添加和编辑句子</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Connection,
  Timer,
  Box,
  Clock,
  Platform,
  Link,
  Document,
  Tools,
  Reading,
  Top,
  SuccessFilled,
  Setting,
  Collection,
  PriceTag
} from '@element-plus/icons-vue'

const router = useRouter()
const startTime = ref(Date.now())
const uptime = ref('')

let intervalId: number | null = null

const calculateUptime = () => {
  const now = Date.now()
  const diff = now - startTime.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  uptime.value = `${hours}h ${minutes}m ${seconds}s`
}

const goToSentenceSet = () => {
  router.push('/sentence-set/overview')
}

const goToCategories = () => {
  router.push('/sentence-set/categories')
}

const goToSentences = () => {
  router.push('/sentence-set/sentences')
}

onMounted(() => {
  calculateUptime()
  intervalId = window.setInterval(calculateUptime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
