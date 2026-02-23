<template>
  <div class="p-4 md:p-6 space-y-6">
    <el-card class="shadow-lg rounded-xl overflow-hidden">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 class="text-xl font-bold text-slate-800">统计分析</h2>
          <div class="flex flex-wrap gap-2">
            <el-select v-model="activeTab" placeholder="选择分析类型" class="w-40">
              <el-option label="班级成绩分析" value="class" />
              <el-option label="科目成绩分析" value="subject" />
              <el-option label="学生成绩趋势" value="trend" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-if="activeTab === 'class'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <el-select v-model="classFilter.school_id" placeholder="选择学校" clearable @change="handleSchoolChange">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
          <el-select v-model="classFilter.class_id" placeholder="选择班级" clearable :disabled="!classFilter.school_id">
            <el-option v-for="cls in filteredClasses" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
          <el-select v-model="classFilter.exam_id" placeholder="选择考试" clearable>
            <el-option v-for="exam in filteredExams" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
        </div>
        <el-button type="primary" @click="loadClassStats" :loading="classStatsLoading" :disabled="!classFilter.class_id || !classFilter.exam_id">
          查询分析
        </el-button>

        <el-table :data="classStats" style="width: 100%" v-loading="classStatsLoading" :stripe="true" border>
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="student_count" label="参考人数" width="100" />
          <el-table-column prop="avg_score" label="平均分" width="100">
            <template #default="{ row }">
              <span :class="getScoreClass(row.avg_score)">{{ row.avg_score?.toFixed(1) ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="max_score" label="最高分" width="100">
            <template #default="{ row }">
              <span class="text-green-600 font-semibold">{{ row.max_score ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="min_score" label="最低分" width="100">
            <template #default="{ row }">
              <span class="text-red-600 font-semibold">{{ row.min_score ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分数段分布">
            <template #default="{ row }">
              <div class="flex gap-1">
                <el-tag size="small" type="success">优秀</el-tag>
                <el-tag size="small" type="warning">良好</el-tag>
                <el-tag size="small" type="info">及格</el-tag>
                <el-tag size="small" type="danger">不及格</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="classStats.length === 0 && !classStatsLoading" description="请选择班级和考试进行查询" />
      </div>

      <div v-if="activeTab === 'subject'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-select v-model="subjectFilter.exam_id" placeholder="选择考试" clearable>
            <el-option v-for="exam in exams" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
          <el-select v-model="subjectFilter.subject" placeholder="选择科目" clearable>
            <el-option-group label="主科">
              <el-option label="语文" value="语文" />
              <el-option label="数学" value="数学" />
              <el-option label="英语" value="英语" />
            </el-option-group>
            <el-option-group label="理科">
              <el-option label="物理" value="物理" />
              <el-option label="化学" value="化学" />
              <el-option label="化学赋分" value="化学赋分" />
              <el-option label="生物" value="生物" />
              <el-option label="生物赋分" value="生物赋分" />
            </el-option-group>
            <el-option-group label="文科">
              <el-option label="历史" value="历史" />
              <el-option label="政治" value="政治" />
              <el-option label="政治赋分" value="政治赋分" />
              <el-option label="地理" value="地理" />
              <el-option label="地理赋分" value="地理赋分" />
            </el-option-group>
          </el-select>
        </div>
        <el-button type="primary" @click="loadSubjectStats" :loading="subjectStatsLoading" :disabled="!subjectFilter.exam_id || !subjectFilter.subject">
          查询分析
        </el-button>

        <el-card v-if="subjectStats" class="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-white rounded-xl shadow-sm">
              <p class="text-sm text-slate-500">平均分</p>
              <p class="text-2xl font-bold text-blue-600">{{ subjectStats.avg_score?.toFixed(1) ?? '-' }}</p>
            </div>
            <div class="text-center p-4 bg-white rounded-xl shadow-sm">
              <p class="text-sm text-slate-500">最高分</p>
              <p class="text-2xl font-bold text-green-600">{{ subjectStats.max_score ?? '-' }}</p>
              <p class="text-xs text-slate-400">{{ subjectStats.max_score_student || '-' }}</p>
            </div>
            <div class="text-center p-4 bg-white rounded-xl shadow-sm">
              <p class="text-sm text-slate-500">最低分</p>
              <p class="text-2xl font-bold text-red-600">{{ subjectStats.min_score ?? '-' }}</p>
              <p class="text-xs text-slate-400">{{ subjectStats.min_score_student || '-' }}</p>
            </div>
            <div class="text-center p-4 bg-white rounded-xl shadow-sm">
              <p class="text-sm text-slate-500">参考人数</p>
              <p class="text-2xl font-bold text-slate-700">{{ subjectStats.student_count }}</p>
            </div>
          </div>
        </el-card>
        <el-empty v-if="!subjectStats && !subjectStatsLoading" description="请选择考试和科目进行查询" />
      </div>

      <div v-if="activeTab === 'trend'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <el-select v-model="trendFilter.school_id" placeholder="选择学校" clearable @change="handleTrendSchoolChange">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
          <el-select v-model="trendFilter.class_id" placeholder="选择班级" clearable :disabled="!trendFilter.school_id" @change="handleTrendClassChange">
            <el-option v-for="cls in filteredTrendClasses" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
          <el-select v-model="trendFilter.student_id" placeholder="选择学生" clearable filterable :disabled="!trendFilter.class_id">
            <el-option v-for="student in filteredStudents" :key="student.id" :label="student.name" :value="student.id" />
          </el-select>
        </div>
        <el-button type="primary" @click="loadStudentTrend" :loading="trendLoading" :disabled="!trendFilter.student_id">
          查询趋势
        </el-button>

        <el-card v-if="studentTrend.length > 0" class="bg-gradient-to-r from-purple-50 to-pink-50">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">{{ studentTrend[0]?.student_name }} 的成绩趋势</span>
            </div>
          </template>
          <el-table :data="studentTrend" style="width: 100%" :stripe="true" border>
            <el-table-column prop="exam_name" label="考试" width="150" />
            <el-table-column prop="exam_date" label="考试日期" width="120" />
            <el-table-column prop="total_score" label="总分" width="100">
              <template #default="{ row }">
                <span class="font-bold text-blue-600">{{ row.total_score ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="chinese" label="语文" width="80">
              <template #default="{ row }">
                <span :class="getScoreClass(row.chinese)">{{ row.chinese ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="math" label="数学" width="80">
              <template #default="{ row }">
                <span :class="getScoreClass(row.math)">{{ row.math ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="english" label="英语" width="80">
              <template #default="{ row }">
                <span :class="getScoreClass(row.english)">{{ row.english ?? '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-empty v-if="studentTrend.length === 0 && !trendLoading" description="请选择学生查询成绩趋势" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSchools,
  getClasses,
  getExams,
  getStudents,
  getClassStats,
  getSubjectStats,
  getStudentTrend,
  type SchoolResponse,
  type ClassResponse,
  type ExamResponse,
  type StudentResponse,
  type ClassStats,
  type SubjectStats,
  type StudentScoreTrend
} from '@/api/school'

const activeTab = ref('class')

const schools = ref<SchoolResponse[]>([])
const classes = ref<ClassResponse[]>([])
const exams = ref<ExamResponse[]>([])
const students = ref<StudentResponse[]>([])
const trendStudents = ref<StudentResponse[]>([])

const classFilter = reactive({
  school_id: '',
  class_id: '',
  exam_id: ''
})

const subjectFilter = reactive({
  exam_id: '',
  subject: ''
})

const trendFilter = reactive({
  school_id: '',
  class_id: '',
  student_id: ''
})

const classStats = ref<ClassStats[]>([])
const subjectStats = ref<SubjectStats | null>(null)
const studentTrend = ref<StudentScoreTrend[]>([])

const classStatsLoading = ref(false)
const subjectStatsLoading = ref(false)
const trendLoading = ref(false)

const filteredClasses = computed(() => {
  if (!classFilter.school_id) return []
  return classes.value.filter(c => c.school_id === classFilter.school_id)
})

const filteredTrendClasses = computed(() => {
  if (!trendFilter.school_id) return []
  return classes.value.filter(c => c.school_id === trendFilter.school_id)
})

const filteredExams = computed(() => {
  if (!classFilter.school_id) return exams.value
  return exams.value.filter(e => e.school_id === classFilter.school_id)
})

const filteredStudents = computed(() => {
  return trendStudents.value
})

const handleSchoolChange = () => {
  classFilter.class_id = ''
}

const handleTrendSchoolChange = () => {
  trendFilter.class_id = ''
  trendFilter.student_id = ''
  trendStudents.value = []
}

const handleTrendClassChange = async () => {
  trendFilter.student_id = ''
  trendStudents.value = []
  
  if (trendFilter.class_id) {
    try {
      const response = await getStudents({ class_id: trendFilter.class_id, page_size: 100 })
      trendStudents.value = response.data.items || []
    } catch (error) {
      console.error('加载班级学生失败:', error)
      ElMessage.error('加载学生数据失败')
    }
  }
}

const loadSchools = async () => {
  try {
    const response = await getSchools()
    schools.value = response.data || []
  } catch (error) {
    console.error('加载学校失败:', error)
  }
}

const loadClasses = async () => {
  try {
    const response = await getClasses()
    classes.value = response.data || []
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

const loadExams = async () => {
  try {
    const response = await getExams()
    exams.value = response.data || []
  } catch (error) {
    console.error('加载考试失败:', error)
  }
}

const loadStudents = async () => {
  try {
    const response = await getStudents({ page_size: 1000 })
    students.value = response.data.items || []
  } catch (error) {
    console.error('加载学生失败:', error)
  }
}

const loadClassStats = async () => {
  if (!classFilter.class_id || !classFilter.exam_id) {
    ElMessage.warning('请选择班级和考试')
    return
  }

  try {
    classStatsLoading.value = true
    const response = await getClassStats(classFilter.class_id, classFilter.exam_id)
    classStats.value = response.data
  } catch (error: any) {
    console.error('加载班级统计失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    classStatsLoading.value = false
  }
}

const loadSubjectStats = async () => {
  if (!subjectFilter.exam_id || !subjectFilter.subject) {
    ElMessage.warning('请选择考试和科目')
    return
  }

  try {
    subjectStatsLoading.value = true
    const response = await getSubjectStats(subjectFilter.exam_id, subjectFilter.subject)
    subjectStats.value = response.data
  } catch (error: any) {
    console.error('加载科目统计失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    subjectStatsLoading.value = false
  }
}

const loadStudentTrend = async () => {
  if (!trendFilter.student_id) {
    ElMessage.warning('请选择学生')
    return
  }

  try {
    trendLoading.value = true
    const response = await getStudentTrend(trendFilter.student_id)
    studentTrend.value = response.data
  } catch (error: any) {
    console.error('加载学生趋势失败:', error)
    ElMessage.error('加载趋势数据失败')
  } finally {
    trendLoading.value = false
  }
}

const getScoreClass = (score: number | null, maxScore: number = 150) => {
  if (score === null) return 'text-slate-400'
  const percentage = (score / maxScore) * 100
  if (percentage >= 90) return 'text-green-600 font-semibold'
  if (percentage >= 80) return 'text-blue-600'
  if (percentage >= 60) return 'text-orange-600'
  return 'text-red-600'
}

onMounted(() => {
  loadSchools()
  loadClasses()
  loadExams()
  loadStudents()
})
</script>

<style scoped>
</style>
