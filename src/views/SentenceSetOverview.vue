<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">句子集概览</h1>
      <div class="flex items-center gap-3">
        <span v-if="lastUpdated" class="text-sm text-slate-500">
          最后更新: {{ formatTime(lastUpdated) }}
        </span>
        <el-button 
          type="primary" 
          :icon="Refresh" 
          :loading="loading" 
          @click="refreshData"
          circle
        />
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-50 rounded-xl">
      <div class="flex items-start gap-3">
        <el-icon class="text-red-500 text-2xl shrink-0"><Warning /></el-icon>
        <div class="flex-1">
          <h3 class="font-semibold text-red-800 mb-1">加载失败</h3>
          <p class="text-sm text-red-600 mb-3">{{ error }}</p>
          <el-button type="primary" size="small" @click="loadData">重试</el-button>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">句子总数</p>
              <p class="text-3xl font-bold text-slate-900 mt-1">{{ animatedStats.totalSentences }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <el-icon class="text-blue-600 text-2xl"><Document /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">分类数量</p>
              <p class="text-3xl font-bold text-slate-900 mt-1">{{ animatedStats.categoryCount }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <el-icon class="text-purple-600 text-2xl"><PriceTag /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">正常句子</p>
              <div class="flex items-baseline gap-2 mt-1">
                <p class="text-3xl font-bold text-green-600">{{ animatedStats.enabledSentences }}</p>
                <p class="text-sm text-slate-500">({{ enabledPercentage }}%)</p>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <el-icon class="text-green-600 text-2xl"><CircleCheck /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">禁用句子</p>
              <div class="flex items-baseline gap-2 mt-1">
                <p class="text-3xl font-bold text-red-600">{{ animatedStats.disabledSentences }}</p>
                <p class="text-sm text-slate-500">({{ disabledPercentage }}%)</p>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <el-icon class="text-red-600 text-2xl"><CircleClose /></el-icon>
            </div>
          </div>
        </el-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-900">分类句子分布</span>
              <el-tag v-if="statsData" type="info" size="small">{{ statsData.categories.length }} 个分类</el-tag>
            </div>
          </template>
          <v-chart v-if="statsData && statsData.categories.length > 0" :option="categoryChartOption" class="h-80" autoresize />
          <el-empty v-else description="暂无分类数据" />
        </el-card>
        
        <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-900">句子状态统计</span>
              <el-tag v-if="statsData" type="info" size="small">共 {{ statsData.total_sentences }} 条</el-tag>
            </div>
          </template>
          <v-chart v-if="statsData && statsData.total_sentences > 0" :option="statusChartOption" class="h-80" autoresize />
          <el-empty v-else description="暂无句子数据" />
        </el-card>
      </div>

      <el-card v-loading="loading" class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">分类详情</span>
            <el-tag v-if="statsData" type="info" size="small">{{ statsData.categories.length }} 个分类</el-tag>
          </div>
        </template>
        <el-table 
          :data="categoryTableData" 
          style="width: 100%" 
          :stripe="true" 
          :border="false"
          :default-sort="{ prop: 'total', order: 'descending' }"
        >
          <el-table-column prop="name" label="分类名称" width="200" />
          <el-table-column label="句子总数" width="120" sortable prop="total">
            <template #default="{ row }">
              <el-tag type="info" effect="plain">{{ row.total }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="100" sortable prop="enabled">
            <template #default="{ row }">
              <span class="text-green-600 font-medium">{{ row.enabled }}</span>
            </template>
          </el-table-column>
          <el-table-column label="禁用" width="100" sortable prop="disabled">
            <template #default="{ row }">
              <span class="text-red-600 font-medium">{{ row.disabled }}</span>
            </template>
          </el-table-column>
          <el-table-column label="启用比例" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <el-progress 
                  :percentage="row.total > 0 ? Math.round((row.enabled / row.total) * 100) : 0" 
                  :stroke-width="10"
                  :color="row.total > 0 && row.enabled / row.total >= 0.8 ? '#10b981' : row.enabled / row.total >= 0.5 ? '#f59e0b' : '#ef4444'"
                  :show-text="false"
                />
                <span class="text-sm text-slate-600 w-12 text-right">
                  {{ row.total > 0 ? Math.round((row.enabled / row.total) * 100) : 0 }}%
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!statsData || statsData.categories.length === 0" description="暂无分类数据" />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Document, PriceTag, CircleCheck, CircleClose, Refresh, Warning } from '@element-plus/icons-vue'
import { getSentenceStats } from '@/api/sentence'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

interface CategoryStats {
  id: string
  name: string
  total: number
  enabled: number
  disabled: number
}

interface StatsData {
  total_sentences: number
  enabled_sentences: number
  disabled_sentences: number
  categories: CategoryStats[]
  lastUpdated?: number
}

const CACHE_KEY = 'sentence_stats_cache'
const CACHE_DURATION = 5 * 60 * 1000

const statsData = ref<StatsData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastUpdated = ref<number | null>(null)

const animatedStats = reactive({
  totalSentences: 0,
  enabledSentences: 0,
  disabledSentences: 0,
  categoryCount: 0
})

let animationFrame: number | null = null

const enabledPercentage = computed(() => {
  if (!statsData.value || statsData.value.total_sentences === 0) return 0
  return Math.round((statsData.value.enabled_sentences / statsData.value.total_sentences) * 100)
})

const disabledPercentage = computed(() => {
  if (!statsData.value || statsData.value.total_sentences === 0) return 0
  return Math.round((statsData.value.disabled_sentences / statsData.value.total_sentences) * 100)
})

const categoryTableData = computed(() => {
  return statsData.value?.categories || []
})

const categoryChartOption = computed(() => {
  if (!statsData.value) return {}
  
  const categories = statsData.value.categories
  const names = categories.map(c => c.name)
  const enabledData = categories.map(c => c.enabled)
  const disabledData = categories.map(c => c.disabled)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['启用', '禁用'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        rotate: names.length > 5 ? 30 : 0,
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '启用',
        type: 'bar',
        stack: 'total',
        data: enabledData,
        itemStyle: { color: '#10b981', borderRadius: [0, 0, 0, 0] },
        emphasis: { itemStyle: { color: '#059669' } }
      },
      {
        name: '禁用',
        type: 'bar',
        stack: 'total',
        data: disabledData,
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
        emphasis: { itemStyle: { color: '#dc2626' } }
      }
    ]
  }
})

const statusChartOption = computed(() => {
  if (!statsData.value) return {}
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '句子状态',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return `{total|${statsData.value?.total_sentences || 0}}\n{label|总计}`
          },
          rich: {
            total: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1e293b'
            },
            label: {
              fontSize: 14,
              color: '#64748b',
              padding: [5, 0, 0, 0]
            }
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { 
            value: statsData.value.enabled_sentences, 
            name: '正常', 
            itemStyle: { color: '#10b981' } 
          },
          { 
            value: statsData.value.disabled_sentences, 
            name: '禁用', 
            itemStyle: { color: '#ef4444' } 
          }
        ]
      }
    ]
  }
})

const animateNumber = (target: keyof typeof animatedStats, end: number, duration: number = 500) => {
  const start = animatedStats[target]
  const startTime = performance.now()
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    animatedStats[target] = Math.round(start + (end - start) * easeProgress)
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
    }
  }
  
  animationFrame = requestAnimationFrame(animate)
}

const updateAnimatedStats = (data: StatsData) => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animateNumber('totalSentences', data.total_sentences)
  animateNumber('enabledSentences', data.enabled_sentences)
  animateNumber('disabledSentences', data.disabled_sentences)
  animateNumber('categoryCount', data.categories.length)
}

const loadCachedData = (): StatsData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const data = JSON.parse(cached)
      if (Date.now() - data.lastUpdated < CACHE_DURATION) {
        return data
      }
    }
  } catch (e) {
    console.error('读取缓存失败:', e)
  }
  return null
}

const saveCachedData = (data: StatsData) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      lastUpdated: Date.now()
    }))
  } catch (e) {
    console.error('保存缓存失败:', e)
  }
}

const loadData = async (forceRefresh: boolean = false) => {
  if (!forceRefresh) {
    const cached = loadCachedData()
    if (cached) {
      statsData.value = cached
      lastUpdated.value = cached.lastUpdated || Date.now()
      updateAnimatedStats(cached)
      return
    }
  }
  
  try {
    loading.value = true
    error.value = null
    
    const response = await getSentenceStats()
    const data = response.data
    
    statsData.value = data
    lastUpdated.value = Date.now()
    saveCachedData(data)
    updateAnimatedStats(data)
  } catch (e: any) {
    console.error('加载统计数据失败:', e)
    error.value = e.response?.data?.detail || e.message || '加载统计数据失败'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData(true)
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
}

:deep(.el-progress-bar__outer) {
  background-color: #f1f5f9;
}
</style>
