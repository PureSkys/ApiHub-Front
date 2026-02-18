<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">句子总数</p>
            <p class="text-3xl font-bold text-slate-900 mt-1">{{ stats.totalSentences }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon class="text-blue-600 text-2xl"><Document /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">分类数量</p>
            <p class="text-3xl font-bold text-slate-900 mt-1">{{ stats.totalCategories }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <el-icon class="text-purple-600 text-2xl"><PriceTag /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">正常句子</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ stats.activeSentences }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <el-icon class="text-green-600 text-2xl"><CircleCheck /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">禁用句子</p>
            <p class="text-3xl font-bold text-red-600 mt-1">{{ stats.disabledSentences }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <el-icon class="text-red-600 text-2xl"><CircleClose /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">分类句子分布</span>
          </div>
        </template>
        <v-chart :option="categoryChartOption" class="h-80" autoresize />
      </el-card>
      
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">句子状态统计</span>
          </div>
        </template>
        <v-chart :option="statusChartOption" class="h-80" autoresize />
      </el-card>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">分类详情</span>
        </div>
      </template>
      <el-table :data="categories" style="width: 100%" :stripe="true" :border="false" v-loading="loading">
        <el-table-column prop="category" label="分类名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="句子数量" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ getCategorySentenceCount(row.id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Document, PriceTag, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { getSentences, getCategories } from '@/api/sentence'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const sentences = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)

const stats = reactive({
  totalSentences: 0,
  totalCategories: 0,
  activeSentences: 0,
  disabledSentences: 0
})

const categoryChartOption = computed(() => {
  const categoryCounts: any = {}
  categories.value.forEach(cat => {
    categoryCounts[cat.category] = 0
  })
  sentences.value.forEach(s => {
    const cat = categories.value.find(c => String(c.id) === String(s.category_id))
    if (cat) {
      categoryCounts[cat.category] = (categoryCounts[cat.category] || 0) + 1
    }
  })
  
  const data = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '句子数量',
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})

const statusChartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '句子状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.activeSentences, name: '正常', itemStyle: { color: '#10b981' } },
          { value: stats.disabledSentences, name: '禁用', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  }
})

const getCategorySentenceCount = (categoryId: any) => {
  return sentences.value.filter(s => String(s.category_id) === String(categoryId)).length
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadData = async () => {
  try {
    loading.value = true
    const [sentencesRes, categoriesRes] = await Promise.all([
      getSentences('all', 100),
      getCategories()
    ])
    
    sentences.value = sentencesRes.data || []
    categories.value = categoriesRes.data || []
    
    stats.totalSentences = sentences.value.length
    stats.totalCategories = categories.value.length
    stats.activeSentences = sentences.value.filter(s => !s.is_disabled).length
    stats.disabledSentences = sentences.value.filter(s => s.is_disabled).length
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
