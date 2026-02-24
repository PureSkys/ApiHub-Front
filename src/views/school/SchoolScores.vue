<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <el-select v-model="filterSchoolId" placeholder="选择学校" clearable class="w-44" @change="handleSchoolFilterChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="filterExamId" placeholder="筛选考试" clearable class="w-44" :disabled="!filterSchoolId" @change="handleFilterChange">
          <el-option v-for="exam in filteredExamsForFilter" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-select v-model="filterStudentId" placeholder="筛选学生" clearable filterable class="w-44" @change="handleFilterChange">
          <el-option v-for="student in students" :key="student.id" :label="student.name" :value="student.id" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索学生姓名" clearable class="w-40">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="resetFilters" size="default">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      <div v-if="selectedIds.length > 0" class="flex items-center gap-3">
        <span class="text-slate-600">已选择 {{ selectedIds.length }} 项</span>
        <el-button type="danger" @click="handleBatchDelete" :loading="batchDeleteLoading" class="transition-all duration-300 hover:scale-105">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button @click="clearSelection" class="transition-all duration-300 hover:scale-105">
          取消选择
        </el-button>
      </div>
      <div v-else class="flex justify-end gap-2">
        <el-button type="primary" @click="handleAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Plus /></el-icon>
          添加成绩
        </el-button>
        <el-button type="success" @click="handleBatchAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Upload /></el-icon>
          批量录入
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        ref="tableRef"
        :data="filteredScores"
        style="width: 100%"
        :stripe="true"
        :border="false"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" width="280">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span class="truncate cursor-pointer text-blue-600 hover:text-blue-800" @click="copyToClipboard(row.id)">
                {{ row.id }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="学生" width="120">
          <template #default="{ row }">
            {{ getStudentName(row.student_id) }}
          </template>
        </el-table-column>
        <el-table-column label="考试" width="150">
          <template #default="{ row }">
            {{ getExamName(row.exam_id) }}
          </template>
        </el-table-column>
        <el-table-column label="主科(150)" align="center">
          <el-table-column prop="chinese" label="语文" width="65">
            <template #default="{ row }">
              <span :class="getScoreClass(row.chinese)">{{ row.chinese ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="math" label="数学" width="65">
            <template #default="{ row }">
              <span :class="getScoreClass(row.math)">{{ row.math ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="english" label="英语" width="65">
            <template #default="{ row }">
              <span :class="getScoreClass(row.english)">{{ row.english ?? '-' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="理科(100)" align="center">
          <el-table-column prop="physics" label="物理" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.physics, 100)">{{ row.physics ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="chemistry" label="化学" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.chemistry, 100)">{{ row.chemistry ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="chemistry_assigned" label="化赋" width="60">
            <template #default="{ row }">
              <span class="text-purple-600">{{ row.chemistry_assigned ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="biology" label="生物" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.biology, 100)">{{ row.biology ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="biology_assigned" label="生赋" width="60">
            <template #default="{ row }">
              <span class="text-purple-600">{{ row.biology_assigned ?? '-' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="文科(100)" align="center">
          <el-table-column prop="history" label="历史" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.history, 100)">{{ row.history ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="politics" label="政治" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.politics, 100)">{{ row.politics ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="politics_assigned" label="政赋" width="60">
            <template #default="{ row }">
              <span class="text-purple-600">{{ row.politics_assigned ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="geography" label="地理" width="60">
            <template #default="{ row }">
              <span :class="getScoreClass(row.geography, 100)">{{ row.geography ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="geography_assigned" label="地赋" width="60">
            <template #default="{ row }">
              <span class="text-purple-600">{{ row.geography_assigned ?? '-' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)" class="transition-all duration-200 hover:scale-110">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row.id)" class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="filteredScores.length === 0 && !loading" description="暂无成绩数据" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑成绩' : '添加成绩'" width="600px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="学生" prop="student_id">
            <el-select v-model="form.student_id" placeholder="请选择学生" filterable class="w-full transition-all duration-300" :disabled="isEdit">
              <el-option v-for="student in students" :key="student.id" :label="student.name" :value="student.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试" prop="exam_id">
            <el-select v-model="form.exam_id" placeholder="请选择考试" class="w-full transition-all duration-300" :disabled="isEdit">
              <el-option v-for="exam in exams" :key="exam.id" :label="exam.name" :value="exam.id" />
            </el-select>
          </el-form-item>
        </div>
        <el-divider content-position="left">主科成绩 (满分150分)</el-divider>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <el-form-item label="语文" prop="chinese">
            <el-input-number v-model="form.chinese" :min="0" :max="150" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="数学" prop="math">
            <el-input-number v-model="form.math" :min="0" :max="150" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="英语" prop="english">
            <el-input-number v-model="form.english" :min="0" :max="150" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
        </div>
        <el-divider content-position="left">理科成绩 (满分100分)</el-divider>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <el-form-item label="物理" prop="physics">
            <el-input-number v-model="form.physics" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="化学" prop="chemistry">
            <el-input-number v-model="form.chemistry" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="化学赋分" prop="chemistry_assigned">
            <el-input-number v-model="form.chemistry_assigned" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="生物" prop="biology">
            <el-input-number v-model="form.biology" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="生物赋分" prop="biology_assigned">
            <el-input-number v-model="form.biology_assigned" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
        </div>
        <el-divider content-position="left">文科成绩 (满分100分)</el-divider>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <el-form-item label="历史" prop="history">
            <el-input-number v-model="form.history" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="政治" prop="politics">
            <el-input-number v-model="form.politics" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="政治赋分" prop="politics_assigned">
            <el-input-number v-model="form.politics_assigned" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="地理" prop="geography">
            <el-input-number v-model="form.geography" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
          <el-form-item label="地理赋分" prop="geography_assigned">
            <el-input-number v-model="form.geography_assigned" :min="0" :max="100" :precision="1" :controls="false" class="w-full transition-all duration-300" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showAddDialog = false; resetForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading" class="transition-all duration-200 hover:scale-105">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showBatchDialog" title="批量导入成绩" width="950px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="batchForm" ref="batchFormRef" label-width="80px" class="px-2 md:px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <el-form-item label="学校" prop="school_id">
            <el-select v-model="batchForm.school_id" placeholder="请选择学校" class="w-full transition-all duration-300" @change="handleBatchSchoolChange">
              <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级" prop="grade">
            <el-select v-model="batchForm.grade" placeholder="请选择年级" class="w-full transition-all duration-300" :disabled="!batchForm.school_id" @change="handleGradeChangeForTemplate">
              <el-option v-for="grade in filteredGradesForBatch" :key="grade.value" :label="grade.label" :value="grade.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="flex gap-2 mb-4">
          <el-button type="primary" plain size="small" @click="handleDownloadScoreTemplate" :disabled="!batchForm.school_id || !batchForm.grade">
            <el-icon><Download /></el-icon>
            下载成绩模板
          </el-button>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleScoreExcelUpload"
          >
            <el-button type="success" plain size="small">
              <el-icon><Upload /></el-icon>
              从Excel导入
            </el-button>
          </el-upload>
        </div>
        <el-alert type="info" :closable="false" class="mb-4">
          <template #title>
            <div class="text-sm">
              <p class="font-semibold mb-2">导入说明：</p>
              <p>1. 选择学校和年级后，点击"下载成绩模板"获取该年级所有学生名单</p>
              <p>2. 成绩字段说明：</p>
              <p class="pl-4 text-slate-500">• 主科（语文/数学/英语）：满分150分，及格线90分</p>
              <p class="pl-4 text-slate-500">• 理科（物理/化学/生物）：满分100分，及格线60分</p>
              <p class="pl-4 text-slate-500">• 文科（历史/政治/地理）：满分100分，及格线60分</p>
              <p class="pl-4 text-slate-500">• 赋分字段为选填，用于新高考赋分制</p>
              <p>3. 填写成绩后上传Excel文件完成导入</p>
            </div>
          </template>
        </el-alert>
        <div v-if="previewScores.length > 0" class="mb-4 p-4 bg-orange-50 rounded-xl">
          <div class="flex items-center gap-4">
            <span class="text-sm font-semibold text-slate-700">选择考试：</span>
            <el-select v-model="batchForm.exam_id" placeholder="请选择要导入的考试" class="flex-1">
              <el-option v-for="exam in filteredExamsForBatch" :key="exam.id" :label="exam.name" :value="exam.id" />
            </el-select>
            <el-button type="primary" @click="handleScoreBatchSubmit" :loading="batchSubmitLoading" :disabled="!batchForm.exam_id">
              确认导入
            </el-button>
          </div>
        </div>
        <el-divider content-position="left">成绩预览</el-divider>
        <el-table :data="previewScores" style="width: 100%" max-height="300" :stripe="true" border size="small">
          <el-table-column prop="student_name" label="学生" width="80" fixed />
          <el-table-column prop="student_number" label="学号" width="90" />
          <el-table-column label="主科(150)" align="center">
            <el-table-column prop="chinese" label="语文" width="60">
              <template #default="{ row }">{{ row.chinese ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="math" label="数学" width="60">
              <template #default="{ row }">{{ row.math ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="english" label="英语" width="60">
              <template #default="{ row }">{{ row.english ?? '-' }}</template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="理科(100)" align="center">
            <el-table-column prop="physics" label="物理" width="50">
              <template #default="{ row }">{{ row.physics ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="chemistry" label="化学" width="50">
              <template #default="{ row }">{{ row.chemistry ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="chemistry_assigned" label="化赋" width="50">
              <template #default="{ row }"><span class="text-purple-600">{{ row.chemistry_assigned ?? '-' }}</span></template>
            </el-table-column>
            <el-table-column prop="biology" label="生物" width="50">
              <template #default="{ row }">{{ row.biology ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="biology_assigned" label="生赋" width="50">
              <template #default="{ row }"><span class="text-purple-600">{{ row.biology_assigned ?? '-' }}</span></template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="文科(100)" align="center">
            <el-table-column prop="history" label="历史" width="50">
              <template #default="{ row }">{{ row.history ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="politics" label="政治" width="50">
              <template #default="{ row }">{{ row.politics ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="politics_assigned" label="政赋" width="50">
              <template #default="{ row }"><span class="text-purple-600">{{ row.politics_assigned ?? '-' }}</span></template>
            </el-table-column>
            <el-table-column prop="geography" label="地理" width="50">
              <template #default="{ row }">{{ row.geography ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="geography_assigned" label="地赋" width="50">
              <template #default="{ row }"><span class="text-purple-600">{{ row.geography_assigned ?? '-' }}</span></template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <div class="text-sm text-slate-500 mt-2">
          共 {{ previewScores.length }} 条成绩数据待导入
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showBatchDialog = false; resetBatchForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleScoreBatchSubmit" :loading="batchSubmitLoading" :disabled="previewScores.length === 0" class="transition-all duration-200 hover:scale-105">导入</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showBatchResultDialog" title="导入结果" width="500px" class="custom-dialog">
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="flex-1 text-center p-4 bg-green-50 rounded-xl">
            <p class="text-2xl font-bold text-green-600">{{ batchResult.success_count }}</p>
            <p class="text-sm text-slate-500">成功</p>
          </div>
          <div class="flex-1 text-center p-4 bg-red-50 rounded-xl">
            <p class="text-2xl font-bold text-red-600">{{ batchResult.fail_count }}</p>
            <p class="text-sm text-slate-500">失败</p>
          </div>
        </div>
        <div v-if="batchResult.errors.length > 0">
          <p class="font-semibold text-slate-700 mb-2">错误详情：</p>
          <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
            <p v-for="(error, index) in batchResult.errors" :key="index" class="text-sm text-red-600 mb-1">{{ error }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showBatchResultDialog = false" class="transition-all duration-200 hover:scale-105">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Plus, Delete, Upload, Download, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getScores,
  createScore,
  createScoreBatch,
  updateScore,
  deleteScore,
  getStudents,
  getExams,
  getClasses,
  getSchools,
  getClassStudents,
  type ScoreResponse,
  type StudentResponse,
  type ExamResponse,
  type ClassResponse,
  type SchoolResponse
} from '@/api/school'
import {
  downloadScoreTemplate,
  parseExcelFile,
  parseScoreExcel,
  type ScoreTemplateRow
} from '@/utils/excelTemplate'
import { saveFilterState, loadFilterState, clearFilterState } from '@/utils/filterStorage'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'

const FILTER_PAGE_KEY = 'scores'

const isMobile = ref(false)
const showAddDialog = ref(false)
const showBatchDialog = ref(false)
const showBatchResultDialog = ref(false)
const scores = ref<ScoreResponse[]>([])
const students = ref<StudentResponse[]>([])
const exams = ref<ExamResponse[]>([])
const classes = ref<ClassResponse[]>([])
const schools = ref<SchoolResponse[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const batchSubmitLoading = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)

const defaultFilterState = { schoolId: '', examId: '', studentId: '', keyword: '' }
const savedFilter = loadFilterState(FILTER_PAGE_KEY, defaultFilterState)
const filterSchoolId = ref(savedFilter.schoolId)
const filterExamId = ref(savedFilter.examId)
const filterStudentId = ref(savedFilter.studentId)
const searchKeyword = ref(savedFilter.keyword)

const form = reactive({
  student_id: '',
  exam_id: '',
  chinese: null as number | null,
  math: null as number | null,
  english: null as number | null,
  physics: null as number | null,
  chemistry: null as number | null,
  chemistry_assigned: null as number | null,
  biology: null as number | null,
  biology_assigned: null as number | null,
  history: null as number | null,
  politics: null as number | null,
  politics_assigned: null as number | null,
  geography: null as number | null,
  geography_assigned: null as number | null
})

const batchForm = reactive({
  school_id: '',
  grade: '',
  exam_id: ''
})

const batchResult = reactive({
  success_count: 0,
  fail_count: 0,
  errors: [] as string[]
})

const previewScores = ref<any[]>([])

const rules: FormRules = {
  student_id: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  exam_id: [
    { required: true, message: '请选择考试', trigger: 'change' }
  ]
}

const filteredScores = computed(() => {
  let result = scores.value
  if (filterExamId.value) {
    result = result.filter(s => s.exam_id === filterExamId.value)
  }
  if (filterStudentId.value) {
    result = result.filter(s => s.student_id === filterStudentId.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    const matchedStudentIds = students.value
      .filter(st => st.name.toLowerCase().includes(keyword))
      .map(st => st.id)
    result = result.filter(s => matchedStudentIds.includes(s.student_id))
  }
  return result
})

const filteredExamsForFilter = computed(() => {
  if (!filterSchoolId.value) return []
  return exams.value.filter(e => e.school_id === filterSchoolId.value)
})

const handleSchoolFilterChange = () => {
  filterExamId.value = ''
  saveCurrentFilter()
}

const handleFilterChange = () => {
  clearSelection()
  saveCurrentFilter()
}

const saveCurrentFilter = () => {
  saveFilterState(FILTER_PAGE_KEY, {
    schoolId: filterSchoolId.value,
    examId: filterExamId.value,
    studentId: filterStudentId.value,
    keyword: searchKeyword.value
  })
}

const resetFilters = () => {
  filterSchoolId.value = ''
  filterExamId.value = ''
  filterStudentId.value = ''
  searchKeyword.value = ''
  clearFilterState(FILTER_PAGE_KEY)
}

watch([filterSchoolId, filterExamId, filterStudentId, searchKeyword], () => {
  saveCurrentFilter()
})

const filteredGradesForBatch = computed(() => {
  if (!batchForm.school_id) return []
  const schoolClasses = classes.value.filter(c => c.school_id === batchForm.school_id)
  const grades = [...new Set(schoolClasses.map(c => c.grade).filter(g => g))]
  return grades.map(g => ({ label: g || '未分年级', value: g }))
})

const filteredExamsForBatch = computed(() => {
  if (!batchForm.school_id) return []
  return exams.value.filter(e => e.school_id === batchForm.school_id)
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const getStudentName = (studentId: string) => {
  const student = students.value.find(s => s.id === studentId)
  return student?.name || '-'
}

const getExamName = (examId: string) => {
  const exam = exams.value.find(e => e.id === examId)
  return exam?.name || '-'
}

const getScoreClass = (score: number | null, maxScore: number = 150) => {
  if (score === null) return 'text-slate-400'
  const percentage = (score / maxScore) * 100
  if (percentage >= 90) return 'text-green-600 font-semibold'
  if (percentage >= 80) return 'text-blue-600'
  if (percentage >= 60) return 'text-orange-600'
  return 'text-red-600'
}

const loadScores = async () => {
  try {
    loading.value = true
    const response = await getScores({ page_size: 100 })
    console.log('Score API response:', response)
    console.log('Response data:', response.data)
    scores.value = response.data.items || []
  } catch (error: any) {
    console.error('加载成绩失败:', error)
    console.error('Error response:', error.response)
    console.error('Error message:', error.message)
    ElMessage.error('加载成绩失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    loading.value = false
  }
}

const loadStudents = async () => {
  try {
    const response = await getStudents({ page_size: 100 })
    console.log('Students for scores:', response)
    students.value = response.data.items || []
  } catch (error: any) {
    console.error('加载学生失败:', error)
  }
}

const loadExams = async () => {
  try {
    const response = await getExams()
    exams.value = response.data
  } catch (error) {
    console.error('加载考试失败:', error)
  }
}

const handleSelectionChange = (selection: ScoreResponse[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
  tableRef.value?.clearSelection()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = ''
  resetForm()
  showAddDialog.value = true
}

const handleBatchAdd = () => {
  resetBatchForm()
  previewScores.value = []
  showBatchDialog.value = true
}

const handleBatchSchoolChange = () => {
  batchForm.grade = ''
  batchForm.exam_id = ''
  previewScores.value = []
}

const handleGradeChangeForTemplate = () => {
  previewScores.value = []
}

const handleDownloadScoreTemplate = async () => {
  if (!batchForm.school_id || !batchForm.grade) return
  
  const school = schools.value.find(s => s.id === batchForm.school_id)
  const schoolName = school?.name || '学校'
  
  const gradeClasses = classes.value.filter(c => c.school_id === batchForm.school_id && c.grade === batchForm.grade)
  
  if (gradeClasses.length === 0) {
    ElMessage.warning('该年级暂无班级数据')
    return
  }
  
  const allStudents: { name: string; student_number: string }[] = []
  
  for (const cls of gradeClasses) {
    try {
      const response = await getClassStudents(cls.id)
      const classStudents = response.data.map(s => ({
        name: s.name,
        student_number: s.student_number
      }))
      allStudents.push(...classStudents)
    } catch (error) {
      console.error(`获取班级 ${cls.name} 学生失败:`, error)
    }
  }
  
  if (allStudents.length === 0) {
    ElMessage.warning('该年级暂无学生数据')
    return
  }
  
  downloadScoreTemplate(`${schoolName}-${batchForm.grade}`, allStudents)
  ElMessage.success(`模板下载成功，共 ${allStudents.length} 名学生`)
}

const handleScoreExcelUpload = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  try {
    const data = await parseExcelFile<ScoreTemplateRow>(file)
    const items = parseScoreExcel(data)
    
    if (items.length === 0) {
      ElMessage.warning('Excel文件中没有有效的成绩数据')
      return
    }

    previewScores.value = items.map(item => ({
      student_number: item.student_number,
      student_name: item.student_name || '',
      ...item.scores
    }))
    
    ElMessage.success(`成功解析 ${items.length} 条成绩数据`)
  } catch (error) {
    console.error('解析Excel失败:', error)
    ElMessage.error('解析Excel文件失败，请检查文件格式')
  }
}

const handleScoreBatchSubmit = async () => {
  if (!batchFormRef.value) return

  try {
    await batchFormRef.value.validate()
    
    if (previewScores.value.length === 0) {
      ElMessage.warning('请先上传成绩数据')
      return
    }

    batchSubmitLoading.value = true

    const scoreData = previewScores.value.map(item => {
      const student = students.value.find(s => s.student_number === item.student_number)
      return {
        student_id: student?.id || '',
        exam_id: batchForm.exam_id,
        chinese: item.chinese,
        math: item.math,
        english: item.english,
        physics: item.physics,
        chemistry: item.chemistry,
        chemistry_assigned: item.chemistry_assigned,
        biology: item.biology,
        biology_assigned: item.biology_assigned,
        history: item.history,
        politics: item.politics,
        politics_assigned: item.politics_assigned,
        geography: item.geography,
        geography_assigned: item.geography_assigned
      }
    }).filter(item => item.student_id)

    if (scoreData.length === 0) {
      ElMessage.warning('没有匹配到有效的学生数据')
      return
    }

    const response = await createScoreBatch(scoreData)
    
    batchResult.success_count = response.data?.length || scoreData.length
    batchResult.fail_count = 0
    batchResult.errors = []

    showBatchDialog.value = false
    showBatchResultDialog.value = true
    await loadScores()
  } catch (error: any) {
    if (error !== false) {
      console.error('批量导入失败:', error)
      ElMessage.error(error.response?.data?.detail || '批量导入失败')
    }
  } finally {
    batchSubmitLoading.value = false
  }
}

const handleEdit = (row: ScoreResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.student_id = row.student_id
  form.exam_id = row.exam_id
  form.chinese = row.chinese
  form.math = row.math
  form.english = row.english
  form.physics = row.physics
  form.chemistry = row.chemistry
  form.biology = row.biology
  form.history = row.history
  form.politics = row.politics
  form.geography = row.geography
  showAddDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateScore(editId.value, {
        chinese: form.chinese ?? undefined,
        math: form.math ?? undefined,
        english: form.english ?? undefined,
        physics: form.physics ?? undefined,
        chemistry: form.chemistry ?? undefined,
        chemistry_assigned: form.chemistry_assigned ?? undefined,
        biology: form.biology ?? undefined,
        biology_assigned: form.biology_assigned ?? undefined,
        history: form.history ?? undefined,
        politics: form.politics ?? undefined,
        politics_assigned: form.politics_assigned ?? undefined,
        geography: form.geography ?? undefined,
        geography_assigned: form.geography_assigned ?? undefined
      })
      ElMessage.success('编辑成功')
    } else {
      await createScore({
        student_id: form.student_id,
        exam_id: form.exam_id,
        chinese: form.chinese ?? undefined,
        math: form.math ?? undefined,
        english: form.english ?? undefined,
        physics: form.physics ?? undefined,
        chemistry: form.chemistry ?? undefined,
        chemistry_assigned: form.chemistry_assigned ?? undefined,
        biology: form.biology ?? undefined,
        biology_assigned: form.biology_assigned ?? undefined,
        history: form.history ?? undefined,
        politics: form.politics ?? undefined,
        politics_assigned: form.politics_assigned ?? undefined,
        geography: form.geography ?? undefined,
        geography_assigned: form.geography_assigned ?? undefined
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadScores()
  } catch (error: any) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条成绩记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteScore(id)
    ElMessage.success('删除成功')
    await loadScores()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的成绩记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条成绩记录吗？此操作不可撤销`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchDeleteLoading.value = true
    await Promise.all(selectedIds.value.map(id => deleteScore(id)))
    ElMessage.success(`成功删除 ${selectedIds.value.length} 条成绩记录`)
    clearSelection()
    await loadScores()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.message || '批量删除失败，请重试')
    }
  } finally {
    batchDeleteLoading.value = false
  }
}

const resetForm = () => {
  form.student_id = ''
  form.exam_id = ''
  form.chinese = null
  form.math = null
  form.english = null
  form.physics = null
  form.chemistry = null
  form.chemistry_assigned = null
  form.biology = null
  form.biology_assigned = null
  form.history = null
  form.politics = null
  form.politics_assigned = null
  form.geography = null
  form.geography_assigned = null
  formRef.value?.clearValidate()
}

const resetBatchForm = () => {
  batchForm.school_id = ''
  batchForm.exam_id = ''
  previewScores.value = []
  batchFormRef.value?.clearValidate()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const loadClasses = async () => {
  try {
    const response = await getClasses()
    classes.value = response.data || []
  } catch (error) {
    console.error('加载班级失败:', error)
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

onMounted(() => {
  checkMobile()
  loadScores()
  loadStudents()
  loadExams()
  loadClasses()
  loadSchools()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style>
.custom-dialog .el-dialog {
  border-radius: 16px !important;
  animation: dialogSlideIn 0.3s ease-out;
}

.custom-dialog .el-dialog__header {
  padding: 20px 24px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.custom-dialog .el-dialog__body {
  padding: 24px !important;
}

.custom-dialog .el-dialog__footer {
  padding: 16px 24px !important;
  border-top: 1px solid #f1f5f9 !important;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
