<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center">
      <div v-if="selectedIds.length > 0" class="flex items-center gap-3">
        <span class="text-slate-600">已选择 {{ selectedIds.length }} 项</span>
        <el-button @click="clearSelection" class="transition-all duration-300 hover:scale-105">
          取消选择
        </el-button>
      </div>
      <div v-else class="flex justify-end">
        <el-button type="primary" @click="handleAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Plus /></el-icon>
          添加管理员
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        ref="tableRef"
        :data="admins"
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
        <el-table-column prop="user_email" label="邮箱" width="200" />
        <el-table-column prop="user_nickname" label="昵称" width="120">
          <template #default="{ row }">
            {{ row.user_nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="school_name" label="所属学校" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" effect="dark">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
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
            <el-button :type="row.is_active ? 'warning' : 'success'" size="small" link @click="handleToggle(row)" class="transition-all duration-200 hover:scale-110">
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row.id)" class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="admins.length === 0 && !loading" description="暂无管理员数据" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑管理员' : '添加管理员'" width="500px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="邮箱" prop="email" v-if="!isEdit">
          <el-input v-model="form.email" placeholder="请输入邮箱" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" class="transition-all duration-300" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" class="transition-all duration-300" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSchoolAdmins,
  createSchoolAdmin,
  updateSchoolAdmin,
  deleteSchoolAdmin,
  toggleSchoolAdmin,
  getSchools,
  type SchoolAdminDetailResponse,
  type SchoolResponse
} from '@/api/school'
import type { FormInstance, FormRules } from 'element-plus'

const isMobile = ref(false)
const showAddDialog = ref(false)
const admins = ref<SchoolAdminDetailResponse[]>([])
const schools = ref<SchoolResponse[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)

const form = reactive({
  email: '',
  password: '',
  nickname: '',
  school_id: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  school_id: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ]
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const loadAdmins = async () => {
  try {
    loading.value = true
    const response = await getSchoolAdmins()
    admins.value = response.data
  } catch (error) {
    console.error('加载管理员失败:', error)
    ElMessage.error('加载管理员失败')
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

const handleSelectionChange = (selection: SchoolAdminDetailResponse[]) => {
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

const handleEdit = (row: SchoolAdminDetailResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.email = row.user_email
  form.nickname = row.user_nickname || ''
  form.school_id = row.school_id
  showAddDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateSchoolAdmin(editId.value, {
        nickname: form.nickname || undefined,
        school_id: form.school_id || undefined
      })
      ElMessage.success('编辑成功')
    } else {
      await createSchoolAdmin({
        email: form.email,
        password: form.password,
        nickname: form.nickname || undefined,
        school_id: form.school_id
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadAdmins()
  } catch (error: any) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleToggle = async (row: SchoolAdminDetailResponse) => {
  try {
    await toggleSchoolAdmin(row.id)
    ElMessage.success(row.is_active ? '已禁用' : '已启用')
    await loadAdmins()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个管理员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteSchoolAdmin(id)
    ElMessage.success('删除成功')
    await loadAdmins()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  form.email = ''
  form.password = ''
  form.nickname = ''
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
  loadAdmins()
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
