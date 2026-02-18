<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <el-select v-model="selectedCategory" placeholder="选择分类过滤" clearable style="width: 200px" @change="loadSentences">
          <el-option label="全部" value="all" />
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.category" :value="String(cat.id)" />
        </el-select>
      </div>
      <div class="flex items-center gap-3">
        <el-button @click="showBatchDialog = true" class="transition-all duration-300 hover:scale-105">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="primary" @click="handleAdd" class="transition-all duration-300 hover:scale-105">
          <el-icon><Plus /></el-icon>
          添加句子
        </el-button>
      </div>
    </div>

    <el-card class="shadow-sm rounded-2xl border-0 transition-all duration-300 hover:shadow-md">
      <el-table
        :data="sentences"
        style="width: 100%"
        :stripe="true"
        :border="false"
        v-loading="loading"
      >
        <el-table-column label="ID" width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span
                class="truncate cursor-pointer text-blue-600 hover:text-blue-800"
                @click="copyToClipboard(row.id)"
              >
                {{ row.id }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="内容" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.sentence || row.content }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="180">
          <template #default="{ row }">
            {{ getCategoryName(row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_disabled ? 'danger' : 'success'" size="small">
              {{ row.is_disabled ? '禁用' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link
              @click="handleEdit(row)"
              class="transition-all duration-200 hover:scale-110">编辑</el-button>
            <el-button type="danger" size="small" link
              @click="handleDelete(row.id)"
              class="transition-all duration-200 hover:scale-110">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="sentences.length === 0 && !loading" description="暂无句子数据" />
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑句子' : '添加句子'"
      width="500px"
      :fullscreen="isMobile"
      class="custom-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="px-2 md:px-4">
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入句子内容"
            class="transition-all duration-300"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select
            v-model="form.category_id"
            placeholder="请选择分类"
            style="width: 100%"
            class="transition-all duration-300"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.category"
              :value="String(cat.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源" prop="from_source">
          <el-input
            v-model="form.from_source"
            placeholder="请输入来源"
            class="transition-all duration-300"
          />
        </el-form-item>
        <el-form-item label="作者" prop="from_who">
          <el-input
            v-model="form.from_who"
            placeholder="请输入作者"
            class="transition-all duration-300"
          />
        </el-form-item>
        <el-form-item label="是否禁用" prop="is_disabled">
          <el-switch v-model="form.is_disabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showDialog = false; resetForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading"
            class="transition-all duration-200 hover:scale-105">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showBatchDialog"
      title="批量导入句子"
      width="700px"
      :fullscreen="isMobile"
      class="custom-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form label-width="80px" class="px-2 md:px-4">
        <el-form-item label="选择分类">
          <el-select
            v-model="batchCategoryId"
            placeholder="请选择分类"
            style="width: 100%"
            class="transition-all duration-300"
            :disabled="showBatchResult"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.category"
              :value="String(cat.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!showBatchResult" label="粘贴数据">
          <el-input
            v-model="batchDataStr"
            type="textarea"
            :rows="12"
            placeholder='请粘贴句子数组，格式示例：
[
  {
    "content": "句子1内容",
    "from_source": "来源",
    "from_who": "作者",
    "is_disabled": false,
    "likes": 0
  },
  {
    "content": "句子2内容",
    "from_source": "来源",
    "from_who": "作者",
    "is_disabled": false,
    "likes": 0
  }
]'
            class="transition-all duration-300 font-mono text-sm"
          />
        </el-form-item>
        <template v-else>
          <el-alert
            :title="`导入完成！成功 ${batchResult.success_count} 条`"
            type="success"
            :closable="false"
            show-icon
            class="mb-4"
          />
          <div v-if="batchResult.db_duplicates && batchResult.db_duplicates.length > 0" class="mt-4">
            <div class="text-sm font-semibold text-slate-700 mb-2">数据库重复 ({{ batchResult.db_duplicates.length }})</div>
            <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
              <div v-for="(item, index) in batchResult.db_duplicates" :key="index" class="text-sm text-slate-600 py-1 border-b border-slate-200 last:border-0">
                {{ item }}
              </div>
            </div>
          </div>
          <div v-if="batchResult.internal_duplicates && batchResult.internal_duplicates.length > 0" class="mt-4">
            <div class="text-sm font-semibold text-slate-700 mb-2">内部重复 ({{ batchResult.internal_duplicates.length }})</div>
            <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
              <div v-for="(item, index) in batchResult.internal_duplicates" :key="index" class="text-sm text-slate-600 py-1 border-b border-slate-200 last:border-0">
                {{ item }}
              </div>
            </div>
          </div>
        </template>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button v-if="!showBatchResult" @click="showBatchDialog = false; resetBatchForm()" class="transition-all duration-200 hover:scale-105">取消</el-button>
          <el-button v-else @click="showBatchDialog = false; resetBatchForm(); showBatchResult = false" class="transition-all duration-200 hover:scale-105">关闭</el-button>
          <el-button v-if="!showBatchResult" type="primary" @click="handleBatchImport" :loading="batchLoading"
            class="transition-all duration-200 hover:scale-105">导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSentence, deleteSentence, updateSentence, getSentences, getCategories } from '@/api/sentence'
import type { FormInstance, FormRules } from 'element-plus'

const isMobile = ref(false)
const showDialog = ref(false)
const showBatchDialog = ref(false)
const showBatchResult = ref(false)
const sentences = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const batchLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const selectedCategory = ref('all')
const batchCategoryId = ref('')
const batchDataStr = ref('')
const batchResult = ref<any>({
  success_count: 0,
  internal_duplicates: [],
  db_duplicates: []
})

const form = reactive({
  content: '',
  category_id: '',
  from_source: '',
  from_who: '',
  is_disabled: false,
  likes: 0
})

const rules: FormRules = {
  content: [
    { required: true, message: '请输入句子内容', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadSentences = async () => {
  try {
    loading.value = true
    const response = await getSentences(selectedCategory.value, 20)
    sentences.value = response.data
  } catch (error) {
    console.error('加载句子失败:', error)
    ElMessage.error('加载句子失败')
  } finally {
    loading.value = false
  }
}

const getCategoryName = (categoryId: any) => {
  if (!categoryId) return '-'
  const cat = categories.value.find(c => String(c.id) === String(categoryId))
  return cat ? cat.category : String(categoryId)
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = ''
  resetForm()
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.content = row.sentence || row.content
  form.category_id = row.category_id
  form.from_source = row.from_source || ''
  form.from_who = row.from_who || ''
  form.is_disabled = row.is_disabled || false
  form.likes = row.likes || 0
  showDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await updateSentence(editId.value, {
        content: form.content,
        category_id: form.category_id,
        is_disabled: form.is_disabled,
        from_source: form.from_source,
        from_who: form.from_who,
        likes: form.likes
      })
      ElMessage.success('编辑成功')
    } else {
      await createSentence({
        content: form.content,
        category_id: form.category_id,
        is_disabled: form.is_disabled,
        from_source: form.from_source,
        from_who: form.from_who,
        likes: form.likes
      })
      ElMessage.success('添加成功')
    }
    
    showDialog.value = false
    resetForm()
    await loadSentences()
  } catch (error: any) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleBatchImport = async () => {
  if (!batchCategoryId.value) {
    ElMessage.error('请选择分类')
    return
  }
  
  if (!batchDataStr.value.trim()) {
    ElMessage.error('请粘贴数据')
    return
  }
  
  try {
    const data = JSON.parse(batchDataStr.value)
    if (!Array.isArray(data)) {
      ElMessage.error('数据格式错误：必须是数组格式')
      return
    }
    
    if (data.length === 0) {
      ElMessage.error('数据不能为空')
      return
    }
    
    const sentencesData = data.map((item: any) => ({
      content: item.content || item.sentence,
      category_id: batchCategoryId.value,
      from_source: item.from_source || '',
      from_who: item.from_who || '',
      is_disabled: item.is_disabled || false,
      likes: item.likes || 0
    }))
    
    batchLoading.value = true
    const response = await createSentence(sentencesData)
    batchResult.value = response.data || {
      success_count: 0,
      internal_duplicates: [],
      db_duplicates: []
    }
    showBatchResult.value = true
    await loadSentences()
  } catch (error: any) {
    console.error('批量导入失败:', error)
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON格式错误，请检查数据格式')
    } else {
      ElMessage.error(error.message || '批量导入失败')
    }
  } finally {
    batchLoading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个句子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteSentence(id)
    ElMessage.success('删除成功')
    await loadSentences()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  form.content = ''
  form.category_id = ''
  form.from_source = ''
  form.from_who = ''
  form.is_disabled = false
  form.likes = 0
  formRef.value?.clearValidate()
}

const resetBatchForm = () => {
  batchCategoryId.value = ''
  batchDataStr.value = ''
  batchResult.value = {
    success_count: 0,
    internal_duplicates: [],
    db_duplicates: []
  }
  showBatchResult.value = false
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  loadCategories()
  loadSentences()
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
