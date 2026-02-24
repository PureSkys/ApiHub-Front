<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <el-select v-model="filterSchoolId" placeholder="筛选学校" clearable class="w-48" @change="handleFilterChange">
          <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
        </el-select>
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
      <div v-else class="flex justify-end">
        <el-button type="primary" @click="handleAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Plus /></el-icon>
          添加考试
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        ref="tableRef"
        :data="filteredExams"
        style="width: 100%"
        :stripe="true"
        :border="false"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span class="truncate cursor-pointer text-blue-600 hover:text-blue-800" @click="copyToClipboard(row.id)">
                {{ row.id }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="考试名称" width="200" />
        <el-table-column prop="exam_date" label="考试日期" width="120" />
        <el-table-column prop="exam_type" label="考试类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.exam_type" size="small">{{ row.exam_type }}</el-tag>
            <span v-else class="text-slate-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="所属学校" width="150">
          <template #default="{ row }">
            {{ getSchoolName(row.school_id) }}
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
      <el-empty v-if="filteredExams.length === 0 && !loading" description="暂无考试数据" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑考试' : '添加考试'" width="500px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入考试名称" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="考试日期" prop="exam_date">
          <el-date-picker v-model="form.exam_date" type="date" placeholder="选择考试日期" value-format="YYYY-MM-DD" class="w-full transition-all duration-300" />
        </el-form-item>
        <el-form-item label="考试类型" prop="exam_type">
          <el-select v-model="form.exam_type" placeholder="请选择考试类型" clearable class="w-full transition-all duration-300">
            <el-option label="期中考试" value="期中考试" />
            <el-option label="期末考试" value="期末考试" />
            <el-option label="月考" value="月考" />
            <el-option label="模拟考试" value="模拟考试" />
            <el-option label="单元测试" value="单元测试" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属学校" prop="school_id">
          <el-select v-model="form.school_id" placeholder="请选择学校" class="w-full transition-all duration-300">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
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

    <el-dialog v-model="showScoresDialog" title="考试成绩" width="950px" :fullscreen="isMobile" class="custom-dialog">
      <el-table :data="examScores" style="width: 100%" :stripe="true" v-loading="scoresLoading" max-height="400" border size="small">
        <el-table-column label="学生" min-width="80" fixed>
          <template #default="{ row }">
            {{ getStudentName(row.student_id) }}
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
      </el-table>
      <el-empty v-if="examScores.length === 0 && !scoresLoading" description="暂无成绩数据" />
      <div class="flex justify-end mt-4" v-if="scoreTotal > 0">
        <el-pagination
          v-model:current-page="scorePage"
          v-model:page-size="scorePageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="scoreTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleScorePageChange"
          @size-change="handleScoreSizeChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getSchools,
  getScores,
  getStudents,
  type ExamResponse,
  type SchoolResponse,
  type ScoreResponse,
  type StudentResponse
} from '@/api/school'
import type { FormInstance, FormRules } from 'element-plus'

const isMobile = ref(false)
const showAddDialog = ref(false)
const showScoresDialog = ref(false)
const exams = ref<ExamResponse[]>([])
const schools = ref<SchoolResponse[]>([])
const students = ref<StudentResponse[]>([])
const examScores = ref<ScoreResponse[]>([])
const currentExamId = ref('')
const scorePage = ref(1)
const scorePageSize = ref(10)
const scoreTotal = ref(0)
const loading = ref(false)
const scoresLoading = ref(false)
const submitLoading = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)
const filterSchoolId = ref('')

const form = reactive({
  name: '',
  exam_date: '',
  exam_type: '',
  school_id: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入考试名称', trigger: 'blur' }
  ],
  exam_date: [
    { required: true, message: '请选择考试日期', trigger: 'change' }
  ],
  school_id: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ]
}

const filteredExams = computed(() => {
  if (!filterSchoolId.value) return exams.value
  return exams.value.filter(e => e.school_id === filterSchoolId.value)
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const getSchoolName = (schoolId: string) => {
  const school = schools.value.find(s => s.id === schoolId)
  return school?.name || '-'
}

const getStudentName = (studentId: string) => {
  const student = students.value.find(s => s.id === studentId)
  return student?.name || '-'
}

const loadExams = async () => {
  try {
    loading.value = true
    const response = await getExams()
    exams.value = response.data
  } catch (error) {
    console.error('加载考试失败:', error)
    ElMessage.error('加载考试失败')
  } finally {
    loading.value = false
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

const loadStudents = async (schoolId?: string) => {
  try {
    const allStudents: StudentResponse[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      const params: { page: number; page_size: number; school_id?: string } = { page, page_size: pageSize }
      if (schoolId) {
        params.school_id = schoolId
      }
      const response = await getStudents(params)
      const items = response.data.items || []
      allStudents.push(...items)
      
      if (items.length < pageSize) {
        hasMore = false
      } else {
        page++
      }
    }

    students.value = allStudents
  } catch (error) {
    console.error('加载学生失败:', error)
  }
}

const handleFilterChange = () => {
  clearSelection()
}

const handleSelectionChange = (selection: ExamResponse[]) => {
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

const handleEdit = (row: ExamResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.exam_date = row.exam_date
  form.exam_type = row.exam_type || ''
  form.school_id = row.school_id
  showAddDialog.value = true
}

const handleViewScores = async (row: ExamResponse) => {
  showScoresDialog.value = true
  currentExamId.value = row.id
  scorePage.value = 1
  await loadExamScores()
  if (students.value.length === 0) {
    loadStudents(row.school_id)
  }
}

const loadExamScores = async () => {
  scoresLoading.value = true
  try {
    const response = await getScores({
      exam_id: currentExamId.value,
      page: scorePage.value,
      page_size: scorePageSize.value
    })
    examScores.value = response.data.items
    scoreTotal.value = response.data.total
  } catch (error) {
    console.error('加载成绩失败:', error)
    ElMessage.error('加载成绩失败')
  } finally {
    scoresLoading.value = false
  }
}

const handleScorePageChange = (page: number) => {
  scorePage.value = page
  loadExamScores()
}

const handleScoreSizeChange = (size: number) => {
  scorePageSize.value = size
  scorePage.value = 1
  loadExamScores()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateExam(editId.value, {
        name: form.name,
        exam_date: form.exam_date,
        exam_type: form.exam_type || undefined
      })
      ElMessage.success('编辑成功')
    } else {
      await createExam({
        name: form.name,
        exam_date: form.exam_date,
        school_id: form.school_id,
        exam_type: form.exam_type || undefined
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadExams()
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
    await ElMessageBox.confirm('确定要删除这个考试吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteExam(id)
    ElMessage.success('删除成功')
    await loadExams()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的考试')
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
    await Promise.all(selectedIds.value.map(id => deleteExam(id)))
    ElMessage.success(`成功删除 ${selectedIds.value.length} 项数据`)
    clearSelection()
    await loadExams()
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
  form.exam_date = ''
  form.exam_type = ''
  form.school_id = ''
  formRef.value?.clearValidate()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  loadExams()
  loadSchools()
  loadStudents()
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
