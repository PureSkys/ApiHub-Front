<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <el-select v-model="filterSchoolId" placeholder="筛选学校" clearable class="w-44" @change="handleSchoolFilterChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
        <el-select v-model="filterClassId" placeholder="筛选班级" clearable class="w-44" :disabled="!filterSchoolId">
          <el-option v-for="cls in filteredClassesForFilter" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索学生姓名" clearable class="w-48" @input="handleSearch">
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
          添加学生
        </el-button>
        <el-button type="success" @click="handleBatchImport" class="transition-all duration-300 hover:scale-105">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        ref="tableRef"
        :data="students"
        style="width: 100%"
        :stripe="true"
        :border="false"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span class="truncate cursor-pointer text-blue-600 hover:text-blue-800" @click="copyToClipboard(row.id)">
                {{ row.id }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small">{{ row.gender }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="student_number" label="学号" width="150" />
        <el-table-column label="班级" width="150">
          <template #default="{ row }">
            {{ getClassName(row.class_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)" class="transition-all duration-200 hover:scale-110">编辑</el-button>
            <el-button type="info" size="small" link @click="handleViewScores(row)" class="transition-all duration-200 hover:scale-110">查看成绩</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row.id)" class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="students.length === 0 && !loading" description="暂无学生数据" />
      <div class="flex justify-end mt-4" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑学生' : '添加学生'" width="500px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学生姓名" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学号" prop="student_number">
          <el-input v-model="form.student_number" placeholder="请输入学号" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="form.class_id" placeholder="请选择班级" class="w-full transition-all duration-300">
            <el-option v-for="cls in classes" :key="cls.id" :label="`${cls.name} (${getSchoolName(cls.school_id)})`" :value="cls.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showAddDialog = false; resetForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading" class="transition-all duration-200 hover:scale-105">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showScoresDialog" title="学生成绩" width="1200px" :fullscreen="isMobile" class="custom-dialog">
      <div v-if="scores.length > 0" class="mb-4 p-4 bg-slate-50 rounded-xl">
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div class="text-center">
            <p class="text-xs text-slate-500">考试次数</p>
            <p class="text-xl font-bold text-blue-600">{{ scores.length }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">平均总分(原始)</p>
            <p class="text-xl font-bold text-green-600">{{ calculateAvgTotal(scores).toFixed(1) }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">平均总分(赋分)</p>
            <p class="text-xl font-bold text-cyan-600">{{ calculateAvgTotalAssigned(scores).toFixed(1) }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">最高总分(原始)</p>
            <p class="text-xl font-bold text-orange-600">{{ calculateMaxTotal(scores).toFixed(1) }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">最高总分(赋分)</p>
            <p class="text-xl font-bold text-orange-500">{{ calculateMaxTotalAssigned(scores).toFixed(1) }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">最低总分(原始)</p>
            <p class="text-xl font-bold text-purple-600">{{ calculateMinTotal(scores).toFixed(1) }}</p>
          </div>
        </div>
      </div>
      <el-table :data="scores" style="width: 100%" :stripe="true" v-loading="scoresLoading" max-height="400" border size="small">
        <el-table-column label="考试" min-width="100" fixed>
          <template #default="{ row }">
            {{ getExamName(row.exam_id) }}
          </template>
        </el-table-column>
        <el-table-column label="主科(150)" align="center">
          <el-table-column prop="chinese" label="语文" min-width="50" align="center">
            <template #default="{ row }">{{ row.chinese ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="math" label="数学" min-width="50" align="center">
            <template #default="{ row }">{{ row.math ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="english" label="英语" min-width="50" align="center">
            <template #default="{ row }">{{ row.english ?? '-' }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="理科(100)" align="center">
          <el-table-column prop="physics" label="物理" min-width="45" align="center">
            <template #default="{ row }">{{ row.physics ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="chemistry" label="化学" min-width="45" align="center">
            <template #default="{ row }">{{ row.chemistry ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="chemistry_assigned" label="化赋" min-width="45" align="center">
            <template #default="{ row }"><span class="text-blue-500">{{ row.chemistry_assigned ?? '-' }}</span></template>
          </el-table-column>
          <el-table-column prop="biology" label="生物" min-width="45" align="center">
            <template #default="{ row }">{{ row.biology ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="biology_assigned" label="生赋" min-width="45" align="center">
            <template #default="{ row }"><span class="text-blue-500">{{ row.biology_assigned ?? '-' }}</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="文科(100)" align="center">
          <el-table-column prop="history" label="历史" min-width="45" align="center">
            <template #default="{ row }">{{ row.history ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="politics" label="政治" min-width="45" align="center">
            <template #default="{ row }">{{ row.politics ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="politics_assigned" label="政赋" min-width="45" align="center">
            <template #default="{ row }"><span class="text-blue-500">{{ row.politics_assigned ?? '-' }}</span></template>
          </el-table-column>
          <el-table-column prop="geography" label="地理" min-width="45" align="center">
            <template #default="{ row }">{{ row.geography ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="geography_assigned" label="地赋" min-width="45" align="center">
            <template #default="{ row }"><span class="text-blue-500">{{ row.geography_assigned ?? '-' }}</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="总分" align="center" fixed="right">
          <el-table-column label="原始" min-width="50" align="center">
            <template #default="{ row }">
              <span class="font-bold text-green-600">{{ calculateTotal(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="赋分" min-width="50" align="center">
            <template #default="{ row }">
              <span class="font-bold text-cyan-600">{{ calculateTotalAssigned(row) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <el-empty v-if="scores.length === 0 && !scoresLoading" description="暂无成绩数据" />
    </el-dialog>

    <el-dialog v-model="showBatchDialog" title="批量导入学生" width="650px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="batchForm" :rules="batchRules" ref="batchFormRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="所属班级" prop="class_id">
          <el-select v-model="batchForm.class_id" placeholder="请选择班级" filterable class="w-full transition-all duration-300">
            <el-option v-for="cls in classes" :key="cls.id" :label="`${cls.name} (${getSchoolName(cls.school_id)})`" :value="cls.id" />
          </el-select>
        </el-form-item>
        <div class="flex gap-2 mb-4">
          <el-button type="primary" plain size="small" @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载Excel模板
          </el-button>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleExcelUpload"
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
              <p class="font-semibold mb-2">导入格式说明：</p>
              <p>每行一个学生，格式：姓名,性别,学号</p>
              <p class="text-slate-500 mt-1">示例：</p>
              <p class="pl-4 text-slate-500">张三,男,2024001</p>
              <p class="pl-4 text-slate-500">李四,女,2024002</p>
              <p class="pl-4 text-slate-500">王五,男,2024003</p>
              <p class="text-slate-500 mt-1">注意：性别只能填"男"或"女"</p>
            </div>
          </template>
        </el-alert>
        <el-form-item label="导入数据" prop="dataText">
          <el-input
            v-model="batchForm.dataText"
            type="textarea"
            :rows="8"
            placeholder="请按格式输入学生数据，每行一个学生，或使用Excel导入"
            class="transition-all duration-300"
          />
        </el-form-item>
        <div class="text-sm text-slate-500 px-2">
          已输入 {{ parsedBatchItems.length }} 条有效数据
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showBatchDialog = false; resetBatchForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit" :loading="batchSubmitLoading" :disabled="parsedBatchItems.length === 0" class="transition-all duration-200 hover:scale-105">导入</el-button>
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
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  getSchools,
  getStudentScores,
  getExams,
  createStudentBatch,
  type StudentResponse,
  type ClassResponse,
  type SchoolResponse,
  type ScoreResponse,
  type ExamResponse,
  type BatchImportResult
} from '@/api/school'
import {
  downloadStudentTemplate,
  parseExcelFile,
  parseStudentExcel,
  type StudentTemplateRow
} from '@/utils/excelTemplate'
import { saveFilterState, loadFilterState, clearFilterState } from '@/utils/filterStorage'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'

const FILTER_PAGE_KEY = 'students'

const isMobile = ref(false)
const showAddDialog = ref(false)
const showScoresDialog = ref(false)
const showBatchDialog = ref(false)
const showBatchResultDialog = ref(false)
const students = ref<StudentResponse[]>([])
const classes = ref<ClassResponse[]>([])
const schools = ref<SchoolResponse[]>([])
const exams = ref<ExamResponse[]>([])
const scores = ref<ScoreResponse[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const scoresLoading = ref(false)
const submitLoading = ref(false)
const batchSubmitLoading = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)

const defaultFilterState = { schoolId: '', classId: '', keyword: '' }
const savedFilter = loadFilterState(FILTER_PAGE_KEY, defaultFilterState)
const filterSchoolId = ref(savedFilter.schoolId)
const filterClassId = ref(savedFilter.classId)
const searchKeyword = ref(savedFilter.keyword)

const batchResult = reactive<BatchImportResult>({
  success_count: 0,
  fail_count: 0,
  errors: []
})

const batchForm = reactive({
  class_id: '',
  dataText: ''
})

const batchRules: FormRules = {
  class_id: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  dataText: [
    { required: true, message: '请输入导入数据', trigger: 'blur' }
  ]
}

const parsedBatchItems = computed(() => {
  const lines = batchForm.dataText.trim().split('\n').filter(line => line.trim())
  return lines.map(line => {
    const parts = line.split(',')
    const name = parts[0]?.trim() || ''
    const gender = parts[1]?.trim() || ''
    const student_number = parts[2]?.trim() || ''
    if (name && gender && student_number) {
      return { name, gender, student_number }
    }
    return null
  }).filter((item): item is { name: string; gender: string; student_number: string } => item !== null)
})

const form = reactive({
  name: '',
  gender: '男',
  student_number: '',
  class_id: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  student_number: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  class_id: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ]
}

const filteredClassesForFilter = computed(() => {
  if (!filterSchoolId.value) return []
  return classes.value.filter(c => c.school_id === filterSchoolId.value)
})

const handleSchoolFilterChange = () => {
  filterClassId.value = ''
  currentPage.value = 1
  clearSelection()
  saveCurrentFilter()
  loadStudents()
}

const handleSearch = () => {
  currentPage.value = 1
  saveCurrentFilter()
  loadStudents()
}

const saveCurrentFilter = () => {
  saveFilterState(FILTER_PAGE_KEY, {
    schoolId: filterSchoolId.value,
    classId: filterClassId.value,
    keyword: searchKeyword.value
  })
}

const resetFilters = () => {
  filterSchoolId.value = ''
  filterClassId.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  clearFilterState(FILTER_PAGE_KEY)
  loadStudents()
}

watch([filterClassId], () => {
  currentPage.value = 1
  saveCurrentFilter()
  loadStudents()
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const getClassName = (classId: string) => {
  const cls = classes.value.find(c => c.id === classId)
  return cls?.name || '-'
}

const getSchoolName = (schoolId: string) => {
  const school = schools.value.find(s => s.id === schoolId)
  return school?.name || '-'
}

const getExamName = (examId: string) => {
  const exam = exams.value.find(e => e.id === examId)
  return exam?.name || '-'
}

const calculateTotal = (score: any): number | string => {
  if (!score) return '-'
  const total = (score.chinese || 0) + (score.math || 0) + (score.english || 0) +
    (score.physics || 0) + (score.chemistry || 0) + (score.biology || 0) +
    (score.history || 0) + (score.politics || 0) + (score.geography || 0)
  return total > 0 ? total : '-'
}

const calculateTotalAssigned = (score: any): number | string => {
  if (!score) return '-'
  const total = (score.chinese || 0) + (score.math || 0) + (score.english || 0) +
    (score.physics || 0) + (score.chemistry_assigned || score.chemistry || 0) + 
    (score.biology_assigned || score.biology || 0) +
    (score.history || 0) + (score.politics_assigned || score.politics || 0) + 
    (score.geography_assigned || score.geography || 0)
  return total > 0 ? total : '-'
}

const calculateAvgTotal = (scores: any[]): number => {
  if (scores.length === 0) return 0
  const totals = scores.map(s => {
    return (s.chinese || 0) + (s.math || 0) + (s.english || 0) +
      (s.physics || 0) + (s.chemistry || 0) + (s.biology || 0) +
      (s.history || 0) + (s.politics || 0) + (s.geography || 0)
  }).filter(t => t > 0)
  if (totals.length === 0) return 0
  return totals.reduce((a, b) => a + b, 0) / totals.length
}

const calculateAvgTotalAssigned = (scores: any[]): number => {
  if (scores.length === 0) return 0
  const totals = scores.map(s => {
    return (s.chinese || 0) + (s.math || 0) + (s.english || 0) +
      (s.physics || 0) + (s.chemistry_assigned || s.chemistry || 0) + 
      (s.biology_assigned || s.biology || 0) +
      (s.history || 0) + (s.politics_assigned || s.politics || 0) + 
      (s.geography_assigned || s.geography || 0)
  }).filter(t => t > 0)
  if (totals.length === 0) return 0
  return totals.reduce((a, b) => a + b, 0) / totals.length
}

const calculateMaxTotal = (scores: any[]): number => {
  if (scores.length === 0) return 0
  const totals = scores.map(s => {
    return (s.chinese || 0) + (s.math || 0) + (s.english || 0) +
      (s.physics || 0) + (s.chemistry || 0) + (s.biology || 0) +
      (s.history || 0) + (s.politics || 0) + (s.geography || 0)
  }).filter(t => t > 0)
  return totals.length > 0 ? Math.max(...totals) : 0
}

const calculateMaxTotalAssigned = (scores: any[]): number => {
  if (scores.length === 0) return 0
  const totals = scores.map(s => {
    return (s.chinese || 0) + (s.math || 0) + (s.english || 0) +
      (s.physics || 0) + (s.chemistry_assigned || s.chemistry || 0) + 
      (s.biology_assigned || s.biology || 0) +
      (s.history || 0) + (s.politics_assigned || s.politics || 0) + 
      (s.geography_assigned || s.geography || 0)
  }).filter(t => t > 0)
  return totals.length > 0 ? Math.max(...totals) : 0
}

const calculateMinTotal = (scores: any[]): number => {
  if (scores.length === 0) return 0
  const totals = scores.map(s => {
    return (s.chinese || 0) + (s.math || 0) + (s.english || 0) +
      (s.physics || 0) + (s.chemistry || 0) + (s.biology || 0) +
      (s.history || 0) + (s.politics || 0) + (s.geography || 0)
  }).filter(t => t > 0)
  return totals.length > 0 ? Math.min(...totals) : 0
}

const loadStudents = async () => {
  try {
    loading.value = true
    const params: { page: number; page_size: number; school_id?: string; class_id?: string; name?: string } = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (filterClassId.value) {
      params.class_id = filterClassId.value
    } else if (filterSchoolId.value) {
      params.school_id = filterSchoolId.value
    }
    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }
    const response = await getStudents(params)
    students.value = response.data.items || []
    total.value = response.data.total
  } catch (error: any) {
    console.error('加载学生失败:', error)
    ElMessage.error('加载学生失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadStudents()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadStudents()
}

const loadClasses = async () => {
  try {
    const response = await getClasses()
    classes.value = response.data
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

const loadSchools = async () => {
  try {
    const response = await getSchools()
    schools.value = response.data
  } catch (error) {
    console.error('加载学校失败:', error)
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

const handleSelectionChange = (selection: StudentResponse[]) => {
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

const handleEdit = (row: StudentResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.gender = row.gender
  form.student_number = row.student_number
  form.class_id = row.class_id
  showAddDialog.value = true
}

const handleViewScores = async (row: StudentResponse) => {
  showScoresDialog.value = true
  scoresLoading.value = true
  try {
    const response = await getStudentScores(row.id)
    scores.value = response.data
  } catch (error) {
    console.error('加载成绩失败:', error)
    ElMessage.error('加载成绩失败')
  } finally {
    scoresLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateStudent(editId.value, {
        name: form.name,
        gender: form.gender,
        student_number: form.student_number,
        class_id: form.class_id
      })
      ElMessage.success('编辑成功')
    } else {
      await createStudent({
        name: form.name,
        gender: form.gender,
        student_number: form.student_number,
        class_id: form.class_id
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadStudents()
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
    await ElMessageBox.confirm('确定要删除这个学生吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteStudent(id)
    ElMessage.success('删除成功')
    await loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的学生')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 项数据吗？此操作不可撤销`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchDeleteLoading.value = true
    await Promise.all(selectedIds.value.map(id => deleteStudent(id)))
    ElMessage.success(`成功删除 ${selectedIds.value.length} 项数据`)
    clearSelection()
    await loadStudents()
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
  form.name = ''
  form.gender = '男'
  form.student_number = ''
  form.class_id = ''
  formRef.value?.clearValidate()
}

const handleBatchImport = () => {
  resetBatchForm()
  showBatchDialog.value = true
}

const resetBatchForm = () => {
  batchForm.class_id = ''
  batchForm.dataText = ''
  batchFormRef.value?.clearValidate()
}

const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return

  try {
    await batchFormRef.value.validate()
    
    if (parsedBatchItems.value.length === 0) {
      ElMessage.warning('请输入有效的学生数据')
      return
    }

    if (parsedBatchItems.value.length > 100) {
      ElMessage.warning('单次最多导入100条数据')
      return
    }

    batchSubmitLoading.value = true
    const response = await createStudentBatch({
      class_id: batchForm.class_id,
      students: parsedBatchItems.value
    })

    batchResult.success_count = response.data.success_count
    batchResult.fail_count = response.data.fail_count
    batchResult.errors = response.data.errors

    showBatchDialog.value = false
    showBatchResultDialog.value = true
    await loadStudents()
  } catch (error: any) {
    if (error !== false) {
      console.error('批量导入失败:', error)
      ElMessage.error(error.response?.data?.detail || '批量导入失败')
    }
  } finally {
    batchSubmitLoading.value = false
  }
}

const handleDownloadTemplate = () => {
  downloadStudentTemplate()
  ElMessage.success('模板下载成功')
}

const handleExcelUpload = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  try {
    const data = await parseExcelFile<StudentTemplateRow>(file)
    const items = parseStudentExcel(data)
    
    if (items.length === 0) {
      ElMessage.warning('Excel文件中没有有效的学生数据')
      return
    }

    const text = items.map(item => `${item.name},${item.gender},${item.student_number}`).join('\n')
    
    batchForm.dataText = text
    ElMessage.success(`成功解析 ${items.length} 条学生数据`)
  } catch (error) {
    console.error('解析Excel失败:', error)
    ElMessage.error('解析Excel文件失败，请检查文件格式')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  loadStudents()
  loadClasses()
  loadSchools()
  loadExams()
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
