<template>
  <div class="space-y-6">
    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <span class="font-semibold text-slate-900">考试综合分析</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <el-select v-model="examFilter.school_id" placeholder="选择学校" clearable @change="handleExamSchoolChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="examFilter.exam_id" placeholder="选择考试" :disabled="!examFilter.school_id"
          @change="onExamSelectChange">
          <el-option v-for="exam in filteredExams" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-button type="primary" @click="loadExamAnalysis" :disabled="!examFilter.exam_id" :loading="examLoading">
          开始分析
        </el-button>
      </div>

      <div v-if="examLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500">
          <Loading />
        </el-icon>
      </div>
      <div v-else-if="examError" class="text-center py-12 text-red-400">
        <el-icon class="text-4xl mb-2">
          <WarningFilled />
        </el-icon>
        <p>{{ examError }}</p>
        <el-button type="primary" size="small" class="mt-4" @click="loadExamAnalysis">重试</el-button>
      </div>
      <div v-else-if="!examFilter.exam_id" class="text-center py-12 text-slate-400">
        请选择学校和考试进行分析
      </div>
      <div v-else-if="examOverview" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-blue-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">参考人数</p>
            <p class="text-2xl font-bold text-blue-600">{{ examOverview.total_students || 0 }}</p>
          </div>
          <div class="p-4 bg-cyan-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">成绩记录</p>
            <p class="text-2xl font-bold text-cyan-600">{{ examOverview.total_scores || 0 }}</p>
          </div>
          <div class="p-4 bg-green-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">平均分</p>
            <p class="text-xl font-bold text-green-600">{{ examOverview.avg_total_score?.toFixed(1) || '-' }}</p>
            <p class="text-xs text-blue-500 mt-1">赋分: {{ examOverview.avg_total_score_assigned?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">最高分</p>
            <p class="text-xl font-bold text-orange-600">{{ examOverview.highest_total_score?.toFixed(1) || '-' }}</p>
            <p class="text-xs text-blue-500 mt-1">赋分: {{ examOverview.highest_total_score_assigned?.toFixed(1) || '-' }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-purple-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">最低分</p>
            <p class="text-xl font-bold text-purple-600">{{ examOverview.lowest_total_score?.toFixed(1) || '-' }}</p>
            <p class="text-xs text-blue-500 mt-1">赋分: {{ examOverview.lowest_total_score_assigned?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">考试类型</p>
            <p class="text-lg font-semibold text-slate-700">{{ examOverview.exam_type || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">考试日期</p>
            <p class="text-lg font-semibold text-slate-700">{{ examOverview.exam_date || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">所属学校</p>
            <p class="text-lg font-semibold text-slate-700">{{ examOverview.school_name || '-' }}</p>
          </div>
        </div>

        <div v-if="scoreDistribution">
          <p class="text-sm font-semibold text-slate-700 mb-3">成绩分布</p>
          <v-chart :option="distributionChartOption" style="height: 300px;" autoresize />
        </div>

        <div v-if="examRanking && examRanking.rankings.length > 0">
          <p class="text-sm font-semibold text-slate-700 mb-3">成绩排名 TOP 15</p>
          <el-table :data="examRanking.rankings.slice(0, 15)" stripe class="w-full" size="small" border>
            <el-table-column prop="rank" label="排名" width="55" align="center" fixed />
            <el-table-column prop="student_name" label="姓名" width="70" fixed />
            <el-table-column prop="class_name" label="班级" width="90" />
            <el-table-column label="总分" width="60" align="center">
              <template #default="{ row }">
                <span class="font-bold text-green-600">{{ row.total_score?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="赋分" width="60" align="center">
              <template #default="{ row }">
                <span class="font-bold text-blue-600">{{ row.total_score_assigned?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="语文" width="55" align="center">
              <template #default="{ row }">{{ row.chinese?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="数学" width="55" align="center">
              <template #default="{ row }">{{ row.math?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="英语" width="55" align="center">
              <template #default="{ row }">{{ row.english?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="物理" width="55" align="center">
              <template #default="{ row }">{{ row.physics?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="历史" width="55" align="center">
              <template #default="{ row }">{{ row.history?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="化学" width="55" align="center">
              <template #default="{ row }">{{ row.chemistry?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="化赋" width="55" align="center">
              <template #default="{ row }">
                <span class="text-blue-500">{{ row.chemistry_assigned?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="生物" width="55" align="center">
              <template #default="{ row }">{{ row.biology?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="生赋" width="55" align="center">
              <template #default="{ row }">
                <span class="text-blue-500">{{ row.biology_assigned?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="政治" width="55" align="center">
              <template #default="{ row }">{{ row.politics?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="政赋" width="55" align="center">
              <template #default="{ row }">
                <span class="text-blue-500">{{ row.politics_assigned?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="地理" width="55" align="center">
              <template #default="{ row }">{{ row.geography?.toFixed(0) || '-' }}</template>
            </el-table-column>
            <el-table-column label="地赋" width="55" align="center">
              <template #default="{ row }">
                <span class="text-blue-500">{{ row.geography_assigned?.toFixed(0) || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="examClassComparison && examClassComparison.classes.length > 0">
          <p class="text-sm font-semibold text-slate-700 mb-3">班级对比分析</p>
          <v-chart :option="classComparisonChartOption" style="height: 300px;" autoresize />
          <div class="mt-4">
            <p class="text-sm font-semibold text-slate-700 mb-3">班级成绩明细</p>
            <el-table :data="examClassComparison.classes" stripe class="w-full" size="small" border>
              <el-table-column prop="class_name" label="班级" width="100" fixed />
              <el-table-column label="总分" width="60" align="center">
                <template #default="{ row }">
                  <span class="font-bold text-green-600">{{ row.avg_total_score?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="赋分" width="60" align="center">
                <template #default="{ row }">
                  <span class="font-bold text-blue-600">{{ row.avg_total_score_assigned?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="语文" width="55" align="center">
                <template #default="{ row }">{{ row.avg_chinese?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="数学" width="55" align="center">
                <template #default="{ row }">{{ row.avg_math?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="英语" width="55" align="center">
                <template #default="{ row }">{{ row.avg_english?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="物理" width="55" align="center">
                <template #default="{ row }">{{ row.avg_physics?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="化学" width="55" align="center">
                <template #default="{ row }">{{ row.avg_chemistry?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="化赋" width="55" align="center">
                <template #default="{ row }">
                  <span class="text-blue-500">{{ row.avg_chemistry_assigned?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="生物" width="55" align="center">
                <template #default="{ row }">{{ row.avg_biology?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="生赋" width="55" align="center">
                <template #default="{ row }">
                  <span class="text-blue-500">{{ row.avg_biology_assigned?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="历史" width="55" align="center">
                <template #default="{ row }">{{ row.avg_history?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="政治" width="55" align="center">
                <template #default="{ row }">{{ row.avg_politics?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="政赋" width="55" align="center">
                <template #default="{ row }">
                  <span class="text-blue-500">{{ row.avg_politics_assigned?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="地理" width="55" align="center">
                <template #default="{ row }">{{ row.avg_geography?.toFixed(1) || '-' }}</template>
              </el-table-column>
              <el-table-column label="地赋" width="55" align="center">
                <template #default="{ row }">
                  <span class="text-blue-500">{{ row.avg_geography_assigned?.toFixed(1) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="student_count" label="人数" width="55" align="center" />
            </el-table>
          </div>
        </div>

        <div v-if="examPassRate && examPassRate.subjects.length > 0">
          <p class="text-sm font-semibold text-slate-700 mb-3">各科及格率</p>
          <v-chart :option="passRateChartOption" style="height: 280px;" autoresize />
        </div>
      </div>
      <div v-else class="text-center py-12 text-slate-400">
        点击"开始分析"按钮加载数据
      </div>
    </el-card>

    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <span class="font-semibold text-slate-900">班级成绩分析</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <el-select v-model="classFilter.school_id" placeholder="选择学校" clearable @change="handleClassSchoolChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="classFilter.class_id" placeholder="选择班级" :disabled="!classFilter.school_id"
          @change="handleClassFilterChange">
          <el-option v-for="cls in filteredClassAnalysisClasses" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select v-model="classFilter.exam_id" placeholder="选择考试" :disabled="!classFilter.class_id"
          @change="onClassExamSelectChange">
          <el-option v-for="exam in filteredClassExams" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-button type="primary" @click="loadClassAnalysis" :disabled="!classFilter.class_id || !classFilter.exam_id"
          :loading="classLoading">
          开始分析
        </el-button>
      </div>

      <div v-if="classLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500">
          <Loading />
        </el-icon>
      </div>
      <div v-else-if="classError" class="text-center py-12 text-red-400">
        <el-icon class="text-4xl mb-2">
          <WarningFilled />
        </el-icon>
        <p>{{ classError }}</p>
        <el-button type="primary" size="small" class="mt-4" @click="loadClassAnalysis">重试</el-button>
      </div>
      <div v-else-if="!classFilter.class_id || !classFilter.exam_id" class="text-center py-12 text-slate-400">
        请选择班级和考试进行分析
      </div>
      <div v-else-if="classExamStats.length > 0" class="space-y-6">
        <div>
          <p class="text-sm font-semibold text-slate-700 mb-3">各科目成绩统计</p>
          <v-chart :option="classSubjectChartOption" style="height: 300px;" autoresize />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-700 mb-3">科目成绩明细</p>
          <el-table :data="classExamStats" stripe class="w-full" size="small">
            <el-table-column prop="subject" label="科目" width="100" />
            <el-table-column label="平均分" width="100">
              <template #default="{ row }">
                <span class="font-semibold text-blue-600">{{ row.avg_score?.toFixed(1) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="最高分" width="100">
              <template #default="{ row }">
                <span class="font-semibold text-green-600">{{ row.max_score?.toFixed(1) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="最低分" width="100">
              <template #default="{ row }">
                <span class="font-semibold text-orange-600">{{ row.min_score?.toFixed(1) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="student_count" label="参考人数" width="100" />
          </el-table>
        </div>
      </div>
      <div v-else class="text-center py-12 text-slate-400">
        点击"开始分析"按钮加载数据
      </div>
    </el-card>

    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <span class="font-semibold text-slate-900">学生成绩趋势</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <el-select v-model="trendFilter.school_id" placeholder="选择学校" clearable @change="handleTrendSchoolChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="trendFilter.class_id" placeholder="选择班级" :disabled="!trendFilter.school_id"
          @change="handleTrendClassChange">
          <el-option v-for="cls in filteredTrendClasses" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select v-model="trendFilter.student_id" placeholder="选择学生" :disabled="!trendFilter.class_id"
          @change="loadStudentTrend">
          <el-option v-for="student in trendStudents" :key="student.id" :label="student.name" :value="student.id" />
        </el-select>
      </div>

      <div v-if="trendLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500">
          <Loading />
        </el-icon>
      </div>
      <div v-else-if="trendError" class="text-center py-12 text-red-400">
        <el-icon class="text-4xl mb-2">
          <WarningFilled />
        </el-icon>
        <p>{{ trendError }}</p>
        <el-button type="primary" size="small" class="mt-4" @click="loadStudentTrend">重试</el-button>
      </div>
      <div v-else-if="!trendFilter.student_id" class="text-center py-12 text-slate-400">
        请选择学生查看成绩趋势
      </div>
      <div v-else-if="studentTrend.length > 0">
        <v-chart :option="trendChartOption" style="height: 350px;" autoresize />
      </div>
      <div v-else class="text-center py-12 text-slate-400">
        该学生暂无成绩数据
      </div>
    </el-card>

    <el-card class="shadow-sm rounded-2xl border-0">
      <template #header>
        <span class="font-semibold text-slate-900">单科深度分析</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <el-select v-model="subjectFilter.school_id" placeholder="选择学校" clearable @change="handleSubjectSchoolChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="subjectFilter.exam_id" placeholder="选择考试" :disabled="!subjectFilter.school_id"
          @change="handleSubjectExamChange">
          <el-option v-for="exam in filteredSubjectExams" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-select v-model="subjectFilter.subject" placeholder="选择科目" :disabled="!subjectFilter.exam_id"
          @change="loadSubjectAnalysis">
          <el-option v-for="subject in subjects" :key="subject" :label="subject" :value="subject" />
        </el-select>
      </div>

      <div v-if="subjectLoading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-3xl text-blue-500">
          <Loading />
        </el-icon>
      </div>
      <div v-else-if="subjectError" class="text-center py-12 text-red-400">
        <el-icon class="text-4xl mb-2">
          <WarningFilled />
        </el-icon>
        <p>{{ subjectError }}</p>
        <el-button type="primary" size="small" class="mt-4" @click="loadSubjectAnalysis">重试</el-button>
      </div>
      <div v-else-if="!subjectFilter.subject" class="text-center py-12 text-slate-400">
        请选择考试和科目进行深度分析
      </div>
      <div v-else-if="subjectStats" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-blue-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">平均分</p>
            <p class="text-2xl font-bold text-blue-600">{{ subjectStats.avg_score?.toFixed(1) || '-' }}</p>
          </div>
          <div class="p-4 bg-green-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">最高分</p>
            <p class="text-2xl font-bold text-green-600">{{ subjectStats.max_score?.toFixed(1) || '-' }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ subjectStats.max_score_student || '-' }}</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">最低分</p>
            <p class="text-2xl font-bold text-orange-600">{{ subjectStats.min_score?.toFixed(1) || '-' }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ subjectStats.min_score_student || '-' }}</p>
          </div>
          <div class="p-4 bg-purple-50 rounded-xl text-center">
            <p class="text-xs text-slate-500 mb-1">参考人数</p>
            <p class="text-2xl font-bold text-purple-600">{{ subjectStats.student_count || 0 }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 text-slate-400">
        暂无数据
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, WarningFilled } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import {
  getSchools,
  getClasses,
  getStudents,
  getExams,
  getExamOverviewStats,
  getScoreDistribution,
  getExamRanking,
  getExamClassComparison,
  getExamPassRate,
  getStudentTrend,
  getClassExamStats,
  getSubjectStats,
  type SchoolResponse,
  type ClassResponse,
  type ExamResponse,
  type StudentResponse,
  type ExamOverviewStats,
  type SubjectScoreDistribution,
  type ExamRanking,
  type ExamClassComparison,
  type ExamPassRateStats,
  type StudentScoreTrend,
  type ClassStats,
  type SubjectStats
} from '@/api/school'

use([CanvasRenderer, BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '政治', '地理']

const schools = ref<SchoolResponse[]>([])
const allClasses = ref<ClassResponse[]>([])
const allExams = ref<ExamResponse[]>([])

const examFilter = reactive({
  school_id: '',
  exam_id: ''
})
const examLoading = ref(false)
const examError = ref('')
const examOverview = ref<ExamOverviewStats | null>(null)
const scoreDistribution = ref<SubjectScoreDistribution | null>(null)
const examRanking = ref<ExamRanking | null>(null)
const examClassComparison = ref<ExamClassComparison | null>(null)
const examPassRate = ref<ExamPassRateStats | null>(null)

const classFilter = reactive({
  school_id: '',
  class_id: '',
  exam_id: ''
})
const classLoading = ref(false)
const classError = ref('')
const classExamStats = ref<ClassStats[]>([])

const trendFilter = reactive({
  school_id: '',
  class_id: '',
  student_id: ''
})
const trendLoading = ref(false)
const trendError = ref('')
const trendStudents = ref<StudentResponse[]>([])
const studentTrend = ref<StudentScoreTrend[]>([])

const subjectFilter = reactive({
  school_id: '',
  exam_id: '',
  subject: ''
})
const subjectLoading = ref(false)
const subjectError = ref('')
const subjectStats = ref<SubjectStats | null>(null)

const filteredExams = computed(() => {
  if (!examFilter.school_id) return []
  return allExams.value.filter(e => e.school_id === examFilter.school_id)
})

const filteredClassAnalysisClasses = computed(() => {
  if (!classFilter.school_id) return []
  return allClasses.value.filter(c => c.school_id === classFilter.school_id)
})

const filteredClassExams = computed(() => {
  if (!classFilter.school_id) return []
  return allExams.value.filter(e => e.school_id === classFilter.school_id)
})

const filteredTrendClasses = computed(() => {
  if (!trendFilter.school_id) return []
  return allClasses.value.filter(c => c.school_id === trendFilter.school_id)
})

const filteredSubjectExams = computed(() => {
  if (!subjectFilter.school_id) return []
  return allExams.value.filter(e => e.school_id === subjectFilter.school_id)
})

const distributionChartOption = computed(() => {
  if (!scoreDistribution || !scoreDistribution.value?.distributions?.length) return {}

  const distribution = scoreDistribution.value.distributions[0]
  if (!distribution) return {}

  const data = [
    { value: distribution.range_0_60, name: '0-60分' },
    { value: distribution.range_60_70, name: '60-70分' },
    { value: distribution.range_70_80, name: '70-80分' },
    { value: distribution.range_80_90, name: '80-90分' },
    { value: distribution.range_90_100, name: '90-100分' },
    { value: distribution.range_100_150, name: '100-150分' }
  ].filter(d => d.value > 0)

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: {
      bottom: '8%',
      left: 'center',
      itemGap: 15
    },
    series: [{
      name: '成绩分布',
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}人', fontSize: 12 },
      labelLine: { length: 10, length2: 10 },
      data: data.map((item, index) => ({
        ...item,
        itemStyle: { color: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][index] }
      }))
    }]
  }
})

const classComparisonChartOption = computed(() => {
  if (!examClassComparison.value?.classes?.length) return {}

  const classes = examClassComparison.value.classes
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['语文', '数学', '英语', '物理', '化学', '化赋', '生物', '生赋', '历史', '政治', '政赋', '地理', '地赋'],
      top: '5%',
      itemGap: 10,
      type: 'scroll'
    },
    grid: { left: '3%', right: '4%', top: '18%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: classes.map(c => c.class_name), axisLabel: { interval: 0, rotate: 0 } },
    yAxis: { type: 'value', name: '平均分', nameGap: 15 },
    series: [
      { name: '语文', type: 'bar', data: classes.map(c => c.avg_chinese?.toFixed(1) || 0), itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }, barGap: '5%' },
      { name: '数学', type: 'bar', data: classes.map(c => c.avg_math?.toFixed(1) || 0), itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
      { name: '英语', type: 'bar', data: classes.map(c => c.avg_english?.toFixed(1) || 0), itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] } },
      { name: '物理', type: 'bar', data: classes.map(c => c.avg_physics?.toFixed(1) || 0), itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] } },
      { name: '化学', type: 'bar', data: classes.map(c => c.avg_chemistry?.toFixed(1) || 0), itemStyle: { color: '#f97316', borderRadius: [4, 4, 0, 0] } },
      { name: '化赋', type: 'bar', data: classes.map(c => c.avg_chemistry_assigned?.toFixed(1) || 0), itemStyle: { color: '#fb923c', borderRadius: [4, 4, 0, 0] } },
      { name: '生物', type: 'bar', data: classes.map(c => c.avg_biology?.toFixed(1) || 0), itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } },
      { name: '生赋', type: 'bar', data: classes.map(c => c.avg_biology_assigned?.toFixed(1) || 0), itemStyle: { color: '#16a34a', borderRadius: [4, 4, 0, 0] } },
      { name: '历史', type: 'bar', data: classes.map(c => c.avg_history?.toFixed(1) || 0), itemStyle: { color: '#a855f7', borderRadius: [4, 4, 0, 0] } },
      { name: '政治', type: 'bar', data: classes.map(c => c.avg_politics?.toFixed(1) || 0), itemStyle: { color: '#d946ef', borderRadius: [4, 4, 0, 0] } },
      { name: '政赋', type: 'bar', data: classes.map(c => c.avg_politics_assigned?.toFixed(1) || 0), itemStyle: { color: '#c026d3', borderRadius: [4, 4, 0, 0] } },
      { name: '地理', type: 'bar', data: classes.map(c => c.avg_geography?.toFixed(1) || 0), itemStyle: { color: '#0ea5e9', borderRadius: [4, 4, 0, 0] } },
      { name: '地赋', type: 'bar', data: classes.map(c => c.avg_geography_assigned?.toFixed(1) || 0), itemStyle: { color: '#0891b2', borderRadius: [4, 4, 0, 0] } }
    ]
  }
})

const passRateChartOption = computed(() => {
  if (!examPassRate.value?.subjects?.length) return {}

  const stats = examPassRate.value.subjects
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', top: '12%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: stats.map(s => s.subject), axisLabel: { interval: 0 } },
    yAxis: { type: 'value', name: '及格率(%)', max: 100, nameGap: 15 },
    series: [{
      name: '及格率',
      type: 'bar',
      data: stats.map(s => s.pass_rate.toFixed(1)),
      itemStyle: {
        color: (params: any) => {
          const item = stats[params.dataIndex]
          if (!item) return '#ef4444'
          const rate = item.pass_rate
          if (rate >= 80) return '#10b981'
          if (rate >= 60) return '#f59e0b'
          return '#ef4444'
        },
        borderRadius: [4, 4, 0, 0]
      },
      label: { show: true, position: 'top', formatter: '{c}%', distance: 5 }
    }]
  }
})

const classSubjectChartOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {
    data: ['平均分', '最高分', '最低分'],
    top: '5%',
    itemGap: 20
  },
  grid: { left: '3%', right: '4%', top: '18%', bottom: '10%', containLabel: true },
  xAxis: { type: 'category', data: classExamStats.value.map(s => s.subject), axisLabel: { interval: 0 } },
  yAxis: { type: 'value', name: '分数', nameGap: 15 },
  series: [
    { name: '平均分', type: 'bar', data: classExamStats.value.map(s => s.avg_score?.toFixed(1) || 0), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, barGap: '10%' },
    { name: '最高分', type: 'bar', data: classExamStats.value.map(s => s.max_score?.toFixed(1) || 0), itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } },
    { name: '最低分', type: 'bar', data: classExamStats.value.map(s => s.min_score?.toFixed(1) || 0), itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } }
  ]
}))

const trendChartOption = computed(() => {
  const trendSubjects = ['语文', '数学', '英语']
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      data: [...trendSubjects, '总分'],
      top: '5%',
      itemGap: 20
    },
    grid: { left: '3%', right: '4%', top: '15%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: studentTrend.value.map(e => e.exam_name), axisLabel: { interval: 0 } },
    yAxis: { type: 'value', name: '分数', nameGap: 15 },
    series: [
      ...trendSubjects.map(subject => ({
        name: subject,
        type: 'line' as const,
        data: studentTrend.value.map(e => e[subject === '语文' ? 'chinese' : subject === '数学' ? 'math' : 'english'] || null),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6
      })),
      {
        name: '总分',
        type: 'line' as const,
        data: studentTrend.value.map(e => e.total_score || null),
        smooth: true,
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
})

const loadInitialData = async () => {
  try {
    const [schoolsRes, classesRes, examsRes] = await Promise.all([getSchools(), getClasses(), getExams()])
    schools.value = schoolsRes.data
    allClasses.value = classesRes.data
    allExams.value = examsRes.data
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

const handleExamSchoolChange = () => {
  examFilter.exam_id = ''
  examOverview.value = null
  scoreDistribution.value = null
  examRanking.value = null
  examClassComparison.value = null
  examPassRate.value = null
  examError.value = ''
}

const onExamSelectChange = () => {
  examOverview.value = null
  examError.value = ''
}

const loadExamAnalysis = async () => {
  if (!examFilter.exam_id) return

  examLoading.value = true
  examError.value = ''
  try {
    const [overviewRes, distributionRes, rankingRes, comparisonRes, passRateRes] = await Promise.all([
      getExamOverviewStats(examFilter.exam_id),
      getScoreDistribution(examFilter.exam_id),
      getExamRanking(examFilter.exam_id, 15),
      getExamClassComparison(examFilter.exam_id),
      getExamPassRate(examFilter.exam_id)
    ])
    examOverview.value = overviewRes.data
    scoreDistribution.value = distributionRes.data
    examRanking.value = rankingRes.data
    examClassComparison.value = comparisonRes.data
    examPassRate.value = passRateRes.data
  } catch (error: any) {
    console.error('加载考试分析失败:', error)
    examError.value = error.response?.data?.detail || '加载考试分析失败，请重试'
  } finally {
    examLoading.value = false
  }
}

const handleClassSchoolChange = () => {
  classFilter.class_id = ''
  classFilter.exam_id = ''
  classExamStats.value = []
  classError.value = ''
}

const handleClassFilterChange = () => {
  classFilter.exam_id = ''
  classExamStats.value = []
  classError.value = ''
}

const onClassExamSelectChange = () => {
  classExamStats.value = []
  classError.value = ''
}

const loadClassAnalysis = async () => {
  if (!classFilter.class_id || !classFilter.exam_id) return

  classLoading.value = true
  classError.value = ''
  try {
    const response = await getClassExamStats(classFilter.class_id, classFilter.exam_id)
    classExamStats.value = response.data || []
  } catch (error: any) {
    console.error('加载班级分析失败:', error)
    classError.value = error.response?.data?.detail || '加载班级分析失败，请重试'
  } finally {
    classLoading.value = false
  }
}

const handleTrendSchoolChange = () => {
  trendFilter.class_id = ''
  trendFilter.student_id = ''
  trendStudents.value = []
  studentTrend.value = []
  trendError.value = ''
}

const handleTrendClassChange = async () => {
  trendFilter.student_id = ''
  studentTrend.value = []
  trendError.value = ''

  if (!trendFilter.class_id) {
    trendStudents.value = []
    return
  }

  try {
    const response = await getStudents({ class_id: trendFilter.class_id, page_size: 100 })
    trendStudents.value = response.data.items || []
  } catch (error) {
    console.error('加载学生失败:', error)
    ElMessage.error('加载学生失败')
  }
}

const loadStudentTrend = async () => {
  if (!trendFilter.student_id) return

  trendLoading.value = true
  trendError.value = ''
  try {
    const response = await getStudentTrend(trendFilter.student_id)
    studentTrend.value = response.data || []
  } catch (error: any) {
    console.error('加载学生趋势失败:', error)
    trendError.value = error.response?.data?.detail || '加载学生趋势失败，请重试'
  } finally {
    trendLoading.value = false
  }
}

const handleSubjectSchoolChange = () => {
  subjectFilter.exam_id = ''
  subjectFilter.subject = ''
  subjectStats.value = null
  subjectError.value = ''
}

const handleSubjectExamChange = () => {
  subjectFilter.subject = ''
  subjectStats.value = null
  subjectError.value = ''
}

const loadSubjectAnalysis = async () => {
  if (!subjectFilter.exam_id || !subjectFilter.subject) return

  subjectLoading.value = true
  subjectError.value = ''
  try {
    const response = await getSubjectStats(subjectFilter.exam_id, subjectFilter.subject)
    subjectStats.value = response.data
  } catch (error: any) {
    console.error('加载科目分析失败:', error)
    subjectError.value = error.response?.data?.detail || '加载科目分析失败，请重试'
  } finally {
    subjectLoading.value = false
  }
}

onMounted(() => {
  loadInitialData()
})
</script>
