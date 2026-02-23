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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">学校列表</span>
            <el-button type="primary" size="small" @click="goToSchools">查看全部</el-button>
          </div>
        </template>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
        </div>
        <div v-else-if="schools.length === 0" class="text-center py-8 text-slate-400">
          暂无学校数据
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="school in schools.slice(0, 5)"
            :key="school.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <el-icon class="text-blue-600"><School /></el-icon>
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ school.name }}</p>
                <p class="text-sm text-slate-500">{{ school.address || '暂无地址' }}</p>
              </div>
            </div>
            <el-tag size="small" type="info">{{ formatDate(school.created_at) }}</el-tag>
          </div>
        </div>
      </el-card>

      <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">最近考试</span>
            <el-button type="primary" size="small" @click="goToExams">查看全部</el-button>
          </div>
        </template>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <el-icon class="animate-spin text-3xl text-blue-500"><Loading /></el-icon>
        </div>
        <div v-else-if="exams.length === 0" class="text-center py-8 text-slate-400">
          暂无考试数据
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="exam in exams.slice(0, 5)"
            :key="exam.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <el-icon class="text-orange-600"><EditPen /></el-icon>
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ exam.name }}</p>
                <p class="text-sm text-slate-500">{{ exam.exam_type || '普通考试' }}</p>
              </div>
            </div>
            <el-tag size="small" type="info">{{ exam.exam_date }}</el-tag>
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
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          @click="goToUsers"
          class="p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl cursor-pointer hover:-translate-y-1 transition-all hover:shadow-md text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white mx-auto mb-2">
            <el-icon class="text-2xl"><User /></el-icon>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">用户管理</h3>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { School, Grid, Avatar, EditPen, TrendCharts, User, Loading } from '@element-plus/icons-vue'
import { getSchools, getClasses, getStudents, getExams, type SchoolResponse, type ExamResponse } from '@/api/school'

const router = useRouter()

const loading = ref(false)
const schools = ref<SchoolResponse[]>([])
const exams = ref<ExamResponse[]>([])

const stats = reactive({
  schools: 0,
  classes: 0,
  students: 0,
  exams: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const [schoolsRes, classesRes, studentsRes, examsRes] = await Promise.all([
      getSchools(),
      getClasses(),
      getStudents(),
      getExams()
    ])
    schools.value = schoolsRes.data
    exams.value = examsRes.data
    stats.schools = schoolsRes.data.length
    stats.classes = classesRes.data.length
    stats.students = studentsRes.data.length
    stats.exams = examsRes.data.length
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const goToSchools = () => router.push('/school-management/schools')
const goToClasses = () => router.push('/school-management/classes')
const goToStudents = () => router.push('/school-management/students')
const goToExams = () => router.push('/school-management/exams')
const goToScores = () => router.push('/school-management/scores')
const goToUsers = () => router.push('/school-management/users')

onMounted(() => {
  loadData()
})
</script>
