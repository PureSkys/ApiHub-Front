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
      <div v-else class="flex justify-end gap-2">
        <el-button type="primary" @click="handleAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Plus /></el-icon>
          添加班级
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
        :data="filteredClasses"
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
        <el-table-column prop="name" label="班级名称" width="150" />
        <el-table-column prop="grade" label="年级" width="100">
          <template #default="{ row }">
            {{ row.grade || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="所属学校" width="150">
          <template #default="{ row }">
            {{ getSchoolName(row.school_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)" class="transition-all duration-200 hover:scale-110">编辑</el-button>
            <el-button type="info" size="small" link @click="handleViewStudents(row)" class="transition-all duration-200 hover:scale-110">查看学生</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row.id)" class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="filteredClasses.length === 0 && !loading" description="暂无班级数据" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑班级' : '添加班级'" width="500px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入年级" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="所属学校" prop="school_id">
          <el-select v-model="form.school_id" placeholder="请选择学校" class="w-full transition-all duration-300">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入班级描述" class="transition-all duration-300" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showAddDialog = false; resetForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading" class="transition-all duration-200 hover:scale-105">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showStudentsDialog" title="班级学生" width="700px" :fullscreen="isMobile" class="custom-dialog">
      <el-table :data="students" style="width: 100%" :stripe="true" v-loading="studentsLoading">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="student_number" label="学号" width="150" />
        <el-table-column prop="created_at" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="students.length === 0 && !studentsLoading" description="暂无学生数据" />
    </el-dialog>

    <el-dialog v-model="showBatchDialog" title="批量导入班级" width="650px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="batchForm" :rules="batchRules" ref="batchFormRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="所属学校" prop="school_id">
          <el-select v-model="batchForm.school_id" placeholder="请选择学校" class="w-full transition-all duration-300">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
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
              <p>每行一个班级，格式：班级名称,年级,描述</p>
              <p class="text-slate-500 mt-1">示例：</p>
              <p class="pl-4 text-slate-500">高一1班,高一,重点班</p>
              <p class="pl-4 text-slate-500">高一2班,高一,普通班</p>
              <p class="pl-4 text-slate-500">高二1班,高二,</p>
              <p class="text-slate-500 mt-1">注意：年级和描述可选，但逗号需保留</p>
            </div>
          </template>
        </el-alert>
        <el-form-item label="导入数据" prop="dataText">
          <el-input
            v-model="batchForm.dataText"
            type="textarea"
            :rows="8"
            placeholder="请按格式输入班级数据，每行一个班级，或使用Excel导入"
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Delete, Upload, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSchools,
  getClassStudents,
  createClassBatch,
  type ClassResponse,
  type SchoolResponse,
  type StudentResponse,
  type BatchImportResult
} from '@/api/school'
import {
  downloadClassTemplate,
  parseExcelFile,
  parseClassExcel,
  type ClassTemplateRow
} from '@/utils/excelTemplate'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'

const isMobile = ref(false)
const showAddDialog = ref(false)
const showStudentsDialog = ref(false)
const showBatchDialog = ref(false)
const showBatchResultDialog = ref(false)
const uploadRef = ref<any>(null)
const classes = ref<ClassResponse[]>([])
const schools = ref<SchoolResponse[]>([])
const students = ref<StudentResponse[]>([])
const loading = ref(false)
const studentsLoading = ref(false)
const submitLoading = ref(false)
const batchSubmitLoading = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)
const filterSchoolId = ref('')

const batchResult = reactive<BatchImportResult>({
  success_count: 0,
  fail_count: 0,
  errors: []
})

const batchForm = reactive({
  school_id: '',
  dataText: ''
})

const batchRules: FormRules = {
  school_id: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ],
  dataText: [
    { required: true, message: '请输入导入数据', trigger: 'blur' }
  ]
}

const parsedBatchItems = computed(() => {
  const lines = batchForm.dataText.trim().split('\n').filter(line => line.trim())
  return lines.map(line => {
    const parts = line.split(',')
    return {
      name: parts[0]?.trim() || '',
      grade: parts[1]?.trim() || undefined,
      description: parts[2]?.trim() || undefined
    }
  }).filter(item => item.name)
})

const form = reactive({
  name: '',
  grade: '',
  school_id: '',
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  school_id: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ]
}

const filteredClasses = computed(() => {
  if (!filterSchoolId.value) return classes.value
  return classes.value.filter(c => c.school_id === filterSchoolId.value)
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

const loadClasses = async () => {
  try {
    loading.value = true
    const response = await getClasses()
    classes.value = response.data
  } catch (error) {
    console.error('加载班级失败:', error)
    ElMessage.error('加载班级失败')
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

const handleFilterChange = () => {
  clearSelection()
}

const handleSelectionChange = (selection: ClassResponse[]) => {
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

const handleEdit = (row: ClassResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.grade = row.grade || ''
  form.school_id = row.school_id
  form.description = row.description || ''
  showAddDialog.value = true
}

const handleViewStudents = async (row: ClassResponse) => {
  showStudentsDialog.value = true
  studentsLoading.value = true
  try {
    const response = await getClassStudents(row.id)
    students.value = response.data
  } catch (error) {
    console.error('加载学生失败:', error)
    ElMessage.error('加载学生失败')
  } finally {
    studentsLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateClass(editId.value, {
        name: form.name,
        grade: form.grade || undefined,
        description: form.description || undefined
      })
      ElMessage.success('编辑成功')
    } else {
      await createClass({
        name: form.name,
        school_id: form.school_id,
        grade: form.grade || undefined,
        description: form.description || undefined
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadClasses()
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
    await ElMessageBox.confirm('确定要删除这个班级吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteClass(id)
    ElMessage.success('删除成功')
    await loadClasses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的班级')
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
    await Promise.all(selectedIds.value.map(id => deleteClass(id)))
    ElMessage.success(`成功删除 ${selectedIds.value.length} 项数据`)
    clearSelection()
    await loadClasses()
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
  form.grade = ''
  form.school_id = ''
  form.description = ''
  formRef.value?.clearValidate()
}

const handleBatchImport = () => {
  resetBatchForm()
  showBatchDialog.value = true
}

const resetBatchForm = () => {
  batchForm.school_id = ''
  batchForm.dataText = ''
  batchFormRef.value?.clearValidate()
}

const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return

  try {
    await batchFormRef.value.validate()
    
    if (parsedBatchItems.value.length === 0) {
      ElMessage.warning('请输入有效的班级数据')
      return
    }

    if (parsedBatchItems.value.length > 100) {
      ElMessage.warning('单次最多导入100条数据')
      return
    }

    batchSubmitLoading.value = true
    const response = await createClassBatch({
      school_id: batchForm.school_id,
      classes: parsedBatchItems.value
    })

    batchResult.success_count = response.data.success_count
    batchResult.fail_count = response.data.fail_count
    batchResult.errors = response.data.errors

    showBatchDialog.value = false
    showBatchResultDialog.value = true
    await loadClasses()
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
  downloadClassTemplate()
  ElMessage.success('模板下载成功')
}

const handleExcelUpload = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  try {
    const data = await parseExcelFile<ClassTemplateRow>(file)
    const items = parseClassExcel(data)
    
    if (items.length === 0) {
      ElMessage.warning('Excel文件中没有有效的班级数据')
      return
    }

    const text = items.map(item => {
      const parts = [item.name, item.grade || '', item.description || '']
      return parts.join(',')
    }).join('\n')
    
    batchForm.dataText = text
    ElMessage.success(`成功解析 ${items.length} 条班级数据`)
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
