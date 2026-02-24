<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">API 健康状态</p>
            <div class="flex items-center gap-2 mt-1">
              <span :class="['w-3 h-3 rounded-full', healthStatusClass]"></span>
              <p class="text-2xl font-bold text-slate-900">{{ healthStatusText }}</p>
            </div>
          </div>
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center', healthBgClass]">
            <el-icon :class="['text-2xl', healthIconClass]"><Connection /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">响应状态</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ responseTime }}</p>
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
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ systemVersion }}</p>
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
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ formattedUptime }}</p>
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
            <el-tag :type="healthTagType" effect="dark">{{ healthTagText }}</el-tag>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <el-icon class="text-green-600"><Link /></el-icon>
              </div>
              <span class="text-sm text-slate-500">API 地址</span>
            </div>
            <el-tag type="info" size="small">{{ apiBaseUrl }}</el-tag>
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
            <el-button v-if="openapiError" type="primary" size="small" :icon="Refresh" @click="fetchOpenAPIData">重试</el-button>
          </div>
        </template>
        <div class="space-y-4">
          <div v-if="openapiLoading" class="flex items-center justify-center py-8">
            <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
            <span class="ml-2 text-slate-500">正在加载API文档...</span>
          </div>
          
          <div v-else-if="openapiError" class="p-4 bg-red-50 rounded-xl">
            <div class="flex items-start gap-3">
              <el-icon class="text-red-500 text-2xl shrink-0"><Warning /></el-icon>
              <div>
                <h3 class="font-semibold text-red-800 mb-1">加载失败</h3>
                <p class="text-sm text-red-600">{{ openapiError }}</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <el-icon class="text-white text-2xl"><Reading /></el-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900 mb-1">OpenAPI 文档</h3>
                  <p class="text-sm text-slate-600 mb-3">完整的 API 接口文档，包含所有接口的请求和响应格式</p>
                  <el-link type="primary" :href="openapiDocsUrl" target="_blank">
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
                    <p class="text-lg font-bold text-slate-900">{{ apiCount }}</p>
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
                    <p class="text-lg font-bold text-slate-900">{{ modelCount }}</p>
                  </div>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div @click="goToSchoolManagement" class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><School /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">学校管理</h3>
              <p class="text-sm text-slate-500">管理学校、班级、学生</p>
            </div>
          </div>
        </div>
        
        <div @click="goToSentenceSet" class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><Collection /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">句子集</h3>
              <p class="text-sm text-slate-500">管理句子和分类</p>
            </div>
          </div>
        </div>
        
        <div @click="goToCategories" class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white">
              <el-icon class="text-2xl"><PriceTag /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">分类管理</h3>
              <p class="text-sm text-slate-500">添加和编辑分类</p>
            </div>
          </div>
        </div>
        
        <div @click="goToSentences" class="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  PriceTag,
  Refresh,
  Loading,
  Warning,
  School
} from '@element-plus/icons-vue'
import { getHealthCheck, type HealthCheckResponse } from '@/api/health'
import {
  API_BASE_URL,
  OPENAPI_DOCS_URL,
  getOpenAPIDocument,
  type OpenAPISchema
} from '@/api/index'

const router = useRouter()

const healthStatus = ref<'loading' | 'healthy' | 'warning' | 'error'>('loading')
const healthData = ref<HealthCheckResponse | null>(null)
const healthPollingInterval = ref<number | null>(null)
const lastRequestTime = ref<number>(0)
const POLLING_INTERVAL = 30000

const openapiLoading = ref(false)
const openapiError = ref('')
const openapiData = ref<OpenAPISchema | null>(null)

const apiBaseUrl = API_BASE_URL
const openapiDocsUrl = OPENAPI_DOCS_URL

const healthStatusClass = computed(() => {
  if (healthStatus.value === 'loading') return 'bg-yellow-500 animate-pulse'
  if (healthStatus.value === 'healthy') return 'bg-green-500 animate-pulse'
  if (healthStatus.value === 'warning') return 'bg-orange-500'
  return 'bg-red-500'
})

const healthBgClass = computed(() => {
  if (healthStatus.value === 'healthy') return 'bg-green-100'
  if (healthStatus.value === 'warning') return 'bg-orange-100'
  if (healthStatus.value === 'error') return 'bg-red-100'
  return 'bg-yellow-100'
})

const healthIconClass = computed(() => {
  if (healthStatus.value === 'healthy') return 'text-green-600'
  if (healthStatus.value === 'warning') return 'text-orange-600'
  if (healthStatus.value === 'error') return 'text-red-600'
  return 'text-yellow-600'
})

const healthStatusText = computed(() => {
  if (healthStatus.value === 'healthy') return '正常'
  if (healthStatus.value === 'warning') return '警告'
  if (healthStatus.value === 'error') return '异常'
  return '检查中'
})

const healthTagType = computed(() => {
  if (healthStatus.value === 'healthy') return 'success'
  if (healthStatus.value === 'warning') return 'warning'
  if (healthStatus.value === 'error') return 'danger'
  return 'info'
})

const healthTagText = computed(() => {
  if (healthStatus.value === 'healthy') return '在线'
  if (healthStatus.value === 'warning') return '警告'
  if (healthStatus.value === 'error') return '离线'
  return '检查中'
})

const systemVersion = computed(() => {
  if (openapiData.value?.info?.version) {
    return `v${openapiData.value.info.version}`
  }
  return 'v0.1.0'
})

const responseTime = computed(() => {
  if (healthStatus.value === 'error') return '超时'
  if (lastRequestTime.value > 0) {
    return `${lastRequestTime.value}ms`
  }
  return '< 100ms'
})

const formattedUptime = computed(() => {
  if (!healthData.value?.uptime) return '未知'
  const uptime = healthData.value.uptime
  let result = ''
  if (uptime.days > 0) result += `${uptime.days}天`
  if (uptime.hours > 0) result += `${uptime.hours}小时`
  if (uptime.minutes > 0) result += `${uptime.minutes}分钟`
  if (uptime.seconds > 0 && result === '') result += `${uptime.seconds}秒`
  return result || '刚刚启动'
})

const apiCount = computed(() => {
  if (!openapiData.value?.paths) return 0
  let count = 0
  for (const path of Object.values(openapiData.value.paths)) {
    count += Object.keys(path).length
  }
  return count
})

const modelCount = computed(() => {
  if (!openapiData.value?.components?.schemas) return 0
  return Object.keys(openapiData.value.components.schemas).length
})

const fetchHealthData = async () => {
  const start = Date.now()
  try {
    healthStatus.value = 'loading'
    const response = await getHealthCheck()
    lastRequestTime.value = Date.now() - start
    healthData.value = response.data
    if (response.data.status === 'healthy') {
      healthStatus.value = 'healthy'
    } else {
      healthStatus.value = 'warning'
    }
  } catch (error) {
    lastRequestTime.value = Date.now() - start
    healthStatus.value = 'error'
  }
}

const fetchOpenAPIData = async () => {
  openapiLoading.value = true
  openapiError.value = ''
  try {
    const response = await getOpenAPIDocument()
    openapiData.value = response.data
  } catch (error: any) {
    openapiError.value = error.message || '无法访问OpenAPI文档，请检查后端服务是否正常运行'
    ElMessage.error('加载API文档失败')
  } finally {
    openapiLoading.value = false
  }
}

const goToSchoolManagement = () => {
  router.push('/school-management/overview')
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
  fetchHealthData()
  fetchOpenAPIData()
  healthPollingInterval.value = window.setInterval(fetchHealthData, POLLING_INTERVAL)
})

onUnmounted(() => {
  if (healthPollingInterval.value) {
    clearInterval(healthPollingInterval.value)
  }
})
</script>
