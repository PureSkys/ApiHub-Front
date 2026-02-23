<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center">
      <div v-if="selectedIds.length > 0" class="flex items-center gap-3">
        <span class="text-slate-600">已选择 {{ selectedIds.length }} 项</span>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :loading="batchDeleteLoading"
          class="transition-all duration-300 hover:scale-105"
        >
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
          添加学校
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        ref="tableRef"
        :data="schools"
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
        <el-table-column prop="name" label="学校名称" width="200" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.address || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="200" show-overflow-tooltip>
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
            <el-button type="danger" size="small" link @click="handleDelete(row.id)" class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="schools.length === 0 && !loading" description="暂无学校数据" />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑学校' : '添加学校'" width="500px" :fullscreen="isMobile" class="custom-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学校名称" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入学校地址" class="transition-all duration-300" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入学校描述" class="transition-all duration-300" />
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
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  type SchoolResponse
} from '@/api/school'
import type { FormInstance, FormRules } from 'element-plus'

const isMobile = ref(false)
const showAddDialog = ref(false)
const schools = ref<SchoolResponse[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const selectedIds = ref<string[]>([])
const tableRef = ref<any>(null)

const form = reactive({
  name: '',
  address: '',
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入学校名称', trigger: 'blur' }
  ]
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const loadSchools = async () => {
  try {
    loading.value = true
    const response = await getSchools()
    schools.value = response.data
  } catch (error) {
    console.error('加载学校失败:', error)
    ElMessage.error('加载学校失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: SchoolResponse[]) => {
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

const handleEdit = (row: SchoolResponse) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.address = row.address || ''
  form.description = row.description || ''
  showAddDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateSchool(editId.value, {
        name: form.name,
        address: form.address || undefined,
        description: form.description || undefined
      })
      ElMessage.success('编辑成功')
    } else {
      await createSchool({
        name: form.name,
        address: form.address || undefined,
        description: form.description || undefined
      })
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    await loadSchools()
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
    await ElMessageBox.confirm('确定要删除这个学校吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteSchool(id)
    ElMessage.success('删除成功')
    await loadSchools()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的学校')
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
    await Promise.all(selectedIds.value.map(id => deleteSchool(id)))
    ElMessage.success(`成功删除 ${selectedIds.value.length} 项数据`)
    clearSelection()
    await loadSchools()
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
  form.address = ''
  form.description = ''
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
