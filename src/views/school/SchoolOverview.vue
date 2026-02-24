<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">学校总数</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.schools }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon class="text-blue-600 text-2xl"><School /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">班级总数</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.classes }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <el-icon class="text-green-600 text-2xl"><Grid /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">学生总数</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.students }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <el-icon class="text-purple-600 text-2xl"><Avatar /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-500 text-sm">考试总数</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.exams }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <el-icon class="text-orange-600 text-2xl"><EditPen /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">学校数据概览</span>
          <el-select v-model="selectedSchoolId" placeholder="选择学校查看详情" class="w-64" @change="loadSchoolStats">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
        </div>
      </template>
      <div v-if="schoolLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
      </div>
      <div v-else-if="!selectedSchoolId" class="text-center py-12 text-slate-400">
        请选择学校查看详细统计数据
      </div>
      <div v-else-if="schoolStats" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="p-4 bg-blue-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">学生人数</p>
            <p class="text-2xl font-bold text-blue-600">{{ schoolStats.total_students }}</p>
          </div>
          <div class="p-4 bg-green-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">班级数量</p>
            <p class="text-2xl font-bold text-green-600">{{ schoolStats.total_classes }}</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">考试次数</p>
            <p class="text-2xl font-bold text-orange-600">{{ schoolStats.total_exams }}</p>
          </div>
          <div class="p-4 bg-cyan-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">男生人数</p>
            <p class="text-2xl font-bold text-cyan-600">{{ schoolStats.male_count }}</p>
          </div>
          <div class="p-4 bg-pink-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">女生人数</p>
            <p class="text-2xl font-bold text-pink-600">{{ schoolStats.female_count }}</p>
          </div>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl">
          <p class="text-sm font-semibold text-slate-700 mb-3">性别分布</p>
          <div class="flex items-center gap-8">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-slate-500">男生</span>
                <span class="text-sm font-bold text-cyan-600">{{ schoolStats.male_count }}人 ({{ malePercentage }}%)</span>
              </div>
              <el-progress :percentage="malePercentage" :stroke-width="15" :show-text="false" color="#06b6d4" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-slate-500">女生</span>
                <span class="text-sm font-bold text-pink-600">{{ schoolStats.female_count }}人 ({{ femalePercentage }}%)</span>
              </div>
              <el-progress :percentage="femalePercentage" :stroke-width="15" :show-text="false" color="#ec4899" />
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">各学校班级分布</span>
          </div>
        </template>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
        </div>
        <div v-else-if="schoolClassData.length === 0" class="text-center py-8 text-slate-400">
          暂无数据
        </div>
        <v-chart v-else :option="classChartOption" style="height: 300px;" autoresize />
      </el-card>

      <el-card class="shadow-sm rounded-2xl border-0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">各学校考试数量</span>
          </div>
        </template>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
        </div>
        <div v-else-if="schoolExamData.length === 0" class="text-center py-8 text-slate-400">
          暂无数据
        </div>
        <v-chart v-else :option="examChartOption" style="height: 300px;" autoresize />
      </el-card>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">最近考试概览</span>
          <el-button type="primary" size="small" @click="goToExams">查看全部</el-button>
        </div>
      </template>
      <div v-if="loading" class="flex items-center justify-center py-8">
        <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
      </div>
      <div v-else-if="exams.length === 0" class="text-center py-8 text-slate-400">
        暂无考试数据
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="exam in exams.slice(0, 6)"
          :key="exam.id"
          class="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          @click="viewExamStats(exam.id)"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-slate-900">{{ exam.name }}</h4>
            <el-tag size="small" type="info">{{ exam.exam_date }}</el-tag>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-slate-500">类型：</span>
              <span class="text-slate-700">{{ exam.exam_type || '普通考试' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">快捷操作</span>
        </div>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          @click="goToSchools"
          class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><School /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">学校管理</h3>
        </div>

        <div
          @click="goToClasses"
          class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><Grid /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">班级管理</h3>
        </div>

        <div
          @click="goToStudents"
          class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><Avatar /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">学生管理</h3>
        </div>

        <div
          @click="goToExams"
          class="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><EditPen /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">考试管理</h3>
        </div>

        <div
          @click="goToScores"
          class="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><TrendCharts /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">成绩管理</h3>
        </div>

        <div
          @click="goToStats"
          class="p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><DataAnalysis /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">统计分析</h3>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="showExamStatsDialog" :title="examStatsTitle" width="900px" destroy-on-close>
      <div v-if="examStatsLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
      </div>
      <div v-else-if="examStats" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-3 bg-blue-50 rounded-lg text-center">
            <p class="text-xs text-slate-500">参考人数</p>
            <p class="text-xl font-bold text-blue-600">{{ examStats.total_students }}</p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg text-center">
            <p class="text-xs text-slate-500">平均分</p>
            <p class="text-xl font-bold text-green-600">{{ examStats.avg_total_score?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-3 bg-orange-50 rounded-lg text-center">
            <p class="text-xs text-slate-500">最高分</p>
            <p class="text-xl font-bold text-orange-600">{{ examStats.highest_total_score?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg text-center">
            <p class="text-xs text-slate-500">最低分</p>
            <p class="text-xl font-bold text-purple-600">{{ examStats.lowest_total_score?.toFixed(1) || '-' }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 rounded-xl">
            <p class="text-sm text-slate-500 mb-2">平均总分(原始)</p>
            <p class="text-2xl font-bold text-green-600">{{ examStats.avg_total_score?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl">
            <p class="text-sm text-slate-500 mb-2">平均总分(赋分)</p>
            <p class="text-2xl font-bold text-cyan-600">{{ examStats.avg_total_score_assigned?.toFixed(1) || '-' }}</p>
          </div>
        </div>
        <div v-if="scoreDistribution && scoreDistribution.distributions.length > 0">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">各科成绩分布</p>
            <el-radio-group v-model="distributionViewMode" size="small">
              <el-radio-button value="stacked">堆叠图</el-radio-button>
              <el-radio-button value="single">单科详情</el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="distributionViewMode === 'stacked'">
            <v-chart :option="distributionStackedChartOption" style="height: 300px;" autoresize />
          </div>
          <div v-else class="space-y-4">
            <el-select v-model="selectedDistributionSubject" placeholder="选择科目" class="w-40 mb-2">
              <el-option v-for="d in scoreDistribution.distributions" :key="d.subject" :label="d.subject" :value="d.subject" />
            </el-select>
            <v-chart :option="distributionSingleChartOption" style="height: 220px;" autoresize />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { School, Grid, Avatar, EditPen, TrendCharts, DataAnalysis, Loading } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import {
  getSchools,
  getClasses,
  getStudents,
  getExams,
  getSchoolOverviewStats,
  getExamOverviewStats,
  getScoreDistribution,
  type SchoolResponse,
  type ExamResponse,
  type ClassResponse,
  type SchoolOverviewStats,
  type ExamOverviewStats,
  type SubjectScoreDistribution
} from '@/api/school'

use([CanvasRenderer, BarChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const router = useRouter()

const loading = ref(false)
const schoolLoading = ref(false)
const schools = ref<SchoolResponse[]>([])
const exams = ref<ExamResponse[]>([])
const classes = ref<ClassResponse[]>([])

const stats = reactive({
  schools: 0,
  classes: 0,
  students: 0,
  exams: 0
})

const selectedSchoolId = ref('')
const schoolStats = ref<SchoolOverviewStats | null>(null)

const malePercentage = computed(() => {
  if (!schoolStats.value || schoolStats.value.total_students === 0) return 0
  return Math.round((schoolStats.value.male_count / schoolStats.value.total_students) * 100)
})

const femalePercentage = computed(() => {
  if (!schoolStats.value || schoolStats.value.total_students === 0) return 0
  return Math.round((schoolStats.value.female_count / schoolStats.value.total_students) * 100)
})

const showExamStatsDialog = ref(false)
const examStatsLoading = ref(false)
const examStatsTitle = ref('')
const examStats = ref<ExamOverviewStats | null>(null)
const scoreDistribution = ref<SubjectScoreDistribution | null>(null)

const distributionViewMode = ref<'stacked' | 'single'>('stacked')
const selectedDistributionSubject = ref('')

const schoolClassData = computed(() => {
  const schoolMap = new Map<string, { name: string; count: number }>()
  schools.value.forEach(s => {
    schoolMap.set(s.id, { name: s.name, count: 0 })
  })
  classes.value.forEach(c => {
    const school = schoolMap.get(c.school_id)
    if (school) {
      school.count++
    }
  })
  return Array.from(schoolMap.values()).filter(s => s.count > 0)
})

const schoolExamData = computed(() => {
  const schoolMap = new Map<string, { name: string; count: number }>()
  schools.value.forEach(s => {
    schoolMap.set(s.id, { name: s.name, count: 0 })
  })
  exams.value.forEach(e => {
    const school = schoolMap.get(e.school_id)
    if (school) {
      school.count++
    }
  })
  return Array.from(schoolMap.values()).filter(s => s.count > 0)
})

const classChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: schoolClassData.value.map(s => s.name),
    axisLabel: {
      rotate: 30,
      interval: 0
    }
  },
  yAxis: {
    type: 'value',
    name: '班级数'
  },
  series: [{
    name: '班级数',
    type: 'bar',
    data: schoolClassData.value.map(s => s.count),
    itemStyle: {
      color: '#10b981',
      borderRadius: [4, 4, 0, 0]
    },
    label: {
      show: true,
      position: 'top'
    }
  }]
}))

const examChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: schoolExamData.value.map(s => s.name),
    axisLabel: {
      rotate: 30,
      interval: 0
    }
  },
  yAxis: {
    type: 'value',
    name: '考试数'
  },
  series: [{
    name: '考试数',
    type: 'bar',
    data: schoolExamData.value.map(s => s.count),
    itemStyle: {
      color: '#f59e0b',
      borderRadius: [4, 4, 0, 0]
    },
    label: {
      show: true,
      position: 'top'
    }
  }]
}))

const distributionStackedChartOption = computed(() => {
  if (!scoreDistribution.value?.distributions?.length) return {}

  const distributions = scoreDistribution.value.distributions
  const subjects = distributions.map(d => d.subject)
  const rangeLabels = ['0-60分', '60-70分', '70-80分', '80-90分', '90-100分', '100-150分']
  const rangeKeys = ['range_0_60', 'range_60_70', 'range_70_80', 'range_80_90', 'range_90_100', 'range_100_150'] as const
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`
        let total = 0
        params.forEach((p: any) => {
          if (p.value > 0) {
            result += `${p.marker} ${p.seriesName}: ${p.value}人<br/>`
            total += p.value
          }
        })
        result += `<strong>合计: ${total}人</strong>`
        return result
      }
    },
    legend: {
      data: rangeLabels,
      top: '3%',
      itemGap: 12
    },
    grid: { left: '3%', right: '4%', top: '15%', bottom: '8%', containLabel: true },
    xAxis: { type: 'category', data: subjects, axisLabel: { interval: 0 } },
    yAxis: { type: 'value', name: '人数', nameGap: 15 },
    series: rangeKeys.map((key, index) => ({
      name: rangeLabels[index],
      type: 'bar',
      stack: 'total',
      data: distributions.map(d => d[key]),
      itemStyle: { color: colors[index] },
      emphasis: { focus: 'series' },
      label: {
        show: true,
        position: 'inside',
        formatter: (params: any) => params.value > 0 ? params.value : '',
        fontSize: 10
      }
    }))
  }
})

const distributionSingleChartOption = computed(() => {
  if (!scoreDistribution.value?.distributions?.length) return {}

  const subject = selectedDistributionSubject.value || scoreDistribution.value.distributions[0]?.subject || ''
  const distribution = scoreDistribution.value.distributions.find(d => d.subject === subject)
  if (!distribution) return {}

  const data = [
    { value: distribution.range_0_60, name: '0-60分' },
    { value: distribution.range_60_70, name: '60-70分' },
    { value: distribution.range_70_80, name: '70-80分' },
    { value: distribution.range_80_90, name: '80-90分' },
    { value: distribution.range_90_100, name: '90-100分' },
    { value: distribution.range_100_150, name: '100-150分' }
  ].filter(d => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: {
      bottom: '5%',
      left: 'center',
      itemGap: 15
    },
    title: {
      text: `${subject}成绩分布`,
      subtext: `共${total}人`,
      left: 'center',
      top: '3%',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
      subtextStyle: { fontSize: 12, color: '#64748b' }
    },
    series: [{
      name: '成绩分布',
      type: 'pie',
      radius: ['35%', '55%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}人\n({d}%)', fontSize: 11 },
      labelLine: { length: 10, length2: 10 },
      data: data.map((item, index) => ({
        ...item,
        itemStyle: { color: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][index] }
      }))
    }]
  }
})

const loadData = async () => {
  loading.value = true
  try {
    const [schoolsRes, classesRes, studentsRes, examsRes] = await Promise.all([
      getSchools(),
      getClasses(),
      getStudents({ page_size: 1 }),
      getExams()
    ])
    schools.value = schoolsRes.data
    classes.value = classesRes.data
    exams.value = examsRes.data
    stats.schools = schoolsRes.data.length
    stats.classes = classesRes.data.length
    stats.students = studentsRes.data.total || 0
    stats.exams = examsRes.data.length
    
    const savedSchoolId = localStorage.getItem('selectedSchoolId')
    if (savedSchoolId && schools.value.some(s => s.id === savedSchoolId)) {
      selectedSchoolId.value = savedSchoolId
    } else if (schools.value.length > 0 && schools.value[0]) {
      selectedSchoolId.value = schools.value[0].id
    }
    
    if (selectedSchoolId.value) {
      await loadSchoolStats()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadSchoolStats = async () => {
  if (!selectedSchoolId.value) {
    schoolStats.value = null
    return
  }
  localStorage.setItem('selectedSchoolId', selectedSchoolId.value)
  schoolLoading.value = true
  try {
    const response = await getSchoolOverviewStats(selectedSchoolId.value)
    schoolStats.value = response.data
  } catch (error) {
    console.error('加载学校统计失败:', error)
    ElMessage.error('加载学校统计失败')
    schoolStats.value = null
  } finally {
    schoolLoading.value = false
  }
}

const viewExamStats = async (examId: string) => {
  const exam = exams.value.find(e => e.id === examId)
  if (!exam) return
  
  examStatsTitle.value = `${exam.name} - 考试统计`
  showExamStatsDialog.value = true
  examStatsLoading.value = true
  
  try {
    const [overviewRes, distributionRes] = await Promise.all([
      getExamOverviewStats(examId),
      getScoreDistribution(examId)
    ])
    examStats.value = overviewRes.data
    scoreDistribution.value = distributionRes.data
    if (distributionRes.data?.distributions?.length && distributionRes.data.distributions[0]) {
      selectedDistributionSubject.value = distributionRes.data.distributions[0].subject
    }
  } catch (error) {
    console.error('加载考试统计失败:', error)
    ElMessage.error('加载考试统计失败')
  } finally {
    examStatsLoading.value = false
  }
}

const goToSchools = () => router.push('/school-management/schools')
const goToClasses = () => router.push('/school-management/classes')
const goToStudents = () => router.push('/school-management/students')
const goToExams = () => router.push('/school-management/exams')
const goToScores = () => router.push('/school-management/scores')
const goToStats = () => router.push('/school-management/stats')

onMounted(() => {
  loadData()
})
</script>
