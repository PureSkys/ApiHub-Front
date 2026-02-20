<template>
  <div class="space-y-5">
    <div class="flex justify-between items-center flex-wrap gap-3">
      <div v-if="selectedSentenceIds.length > 0" class="flex items-center gap-3 flex-wrap">
        <span class="text-slate-600">已选择 {{ selectedSentenceIds.length }} 项</span>
        <el-dropdown @command="handleBatchStatusChange">
          <el-button type="primary" :loading="batchStatusLoading" class="transition-all duration-300 hover:scale-105">
            <el-icon><Operation /></el-icon>
            批量操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="enable">
                <el-icon class="mr-2"><Check /></el-icon>
                启用
              </el-dropdown-item>
              <el-dropdown-item command="disable">
                <el-icon class="mr-2"><Close /></el-icon>
                禁用
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
      <div v-else class="flex items-center gap-3">
        <el-select v-model="selectedCategory" placeholder="选择分类过滤" style="width: 200px" @change="handleCategoryChange">
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
        ref="tableRef"
        :data="sentences"
        style="width: 100%"
        :stripe="true"
        :border="false"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
      
      <div v-if="total > 0" class="pagination-container mt-6">
        <div class="pagination-info flex items-center justify-between mb-4 px-2">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 text-sm">共</span>
              <span class="text-indigo-600 font-bold text-lg">{{ total }}</span>
              <span class="text-slate-500 text-sm">条记录</span>
            </div>
            <div class="h-4 w-px bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <span class="text-slate-500 text-sm">第</span>
              <span class="text-indigo-600 font-bold text-lg">{{ currentPage }}</span>
              <span class="text-slate-500 text-sm">/</span>
              <span class="text-slate-600 font-semibold">{{ totalPages }}</span>
              <span class="text-slate-500 text-sm">页</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-500 text-sm">每页显示</span>
            <el-select
              v-model="pageSize"
              @change="handleSizeChange"
              class="w-24"
              size="small"
            >
              <el-option label="10条" :value="10" />
              <el-option label="20条" :value="20" />
              <el-option label="50条" :value="50" />
              <el-option label="100条" :value="100" />
            </el-select>
          </div>
        </div>
        
        <div class="pagination-controls flex items-center justify-center gap-2">
          <el-button
            :disabled="currentPage <= 1 || loading"
            @click="goToPage(1)"
            size="small"
            class="pagination-btn"
          >
            <el-icon><DArrowLeft /></el-icon>
          </el-button>
          
          <el-button
            :disabled="currentPage <= 1 || loading"
            @click="goToPage(currentPage - 1)"
            size="small"
            class="pagination-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          
          <template v-for="page in visiblePages" :key="page">
            <el-button
              v-if="page !== '...'"
              :type="page === currentPage ? 'primary' : ''"
              size="small"
              @click="goToPage(Number(page))"
              :loading="loading && page === currentPage"
              class="pagination-page-btn"
              :class="{ 'is-active': page === currentPage }"
            >
              {{ page }}
            </el-button>
            <span v-else class="px-2 text-slate-400">...</span>
          </template>
          
          <el-button
            :disabled="currentPage >= totalPages || loading"
            @click="goToPage(currentPage + 1)"
            size="small"
            class="pagination-btn"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          
          <el-button
            :disabled="currentPage >= totalPages || loading"
            @click="goToPage(totalPages)"
            size="small"
            class="pagination-btn"
          >
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
        
        <div class="pagination-jump flex items-center justify-center gap-2 mt-4">
          <span class="text-slate-500 text-sm">跳转到</span>
          <el-input-number
            v-model="jumpPage"
            :min="1"
            :max="totalPages"
            size="small"
            :controls="false"
            class="w-20"
            @keyup.enter="handleJump"
          />
          <span class="text-slate-500 text-sm">页</span>
          <el-button type="primary" size="small" @click="handleJump" :loading="loading">
            确定
          </el-button>
        </div>
      </div>
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
      width="900px"
      :fullscreen="isMobile"
      class="custom-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-steps :active="batchStep - 1" finish-status="success" align-center class="mb-6">
        <el-step title="数据输入" />
        <el-step title="字段映射" />
        <el-step title="验证确认" />
        <el-step title="导入结果" />
      </el-steps>
      
      <div class="px-2 md:px-4">
        <template v-if="batchStep === 1">
          <el-form label-width="100px">
            <el-form-item label="选择分类">
              <el-select
                v-model="batchCategoryId"
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
            <el-form-item label="粘贴JSON数据">
              <el-input
                v-model="batchDataStr"
                type="textarea"
                :rows="14"
                placeholder='请粘贴JSON数组数据，格式示例：
[
  {
    "content": "句子1内容",
    "source": "来源",
    "author": "作者",
    "disabled": false,
    "likes": 0
  },
  {
    "content": "句子2内容",
    "source": "来源",
    "author": "作者",
    "disabled": false,
    "likes": 0
  }
]'
                class="transition-all duration-300 font-mono text-sm"
              />
            </el-form-item>
            <el-alert
              v-if="batchParseError"
              type="error"
              :title="batchParseError"
              show-icon
              class="mb-4"
            />
          </el-form>
        </template>
        
        <template v-else-if="batchStep === 2">
          <div class="mb-4">
            <div class="text-sm font-semibold text-slate-700 mb-3">字段映射配置</div>
            <el-table :data="fieldMapping" border style="width: 100%">
              <el-table-column label="系统字段" prop="targetField" width="150">
                <template #default="{ row }">
                  <span class="font-medium">{{ row.targetFieldLabel }}</span>
                </template>
              </el-table-column>
              <el-table-column label="配置方式" width="140">
                <template #default="{ row }">
                  <el-radio-group v-model="row.configMode" size="small" v-if="!row.required">
                    <el-radio-button value="map">映射字段</el-radio-button>
                    <el-radio-button value="default">默认值</el-radio-button>
                  </el-radio-group>
                  <el-tag type="info" size="small" v-else>必须映射</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="配置内容">
                <template #default="{ row }">
                  <template v-if="row.configMode === 'map' || row.required">
                    <el-select v-model="row.sourceField" placeholder="选择字段" style="width: 100%">
                      <el-option v-if="!row.required" label="不映射" value="" />
                      <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
                    </el-select>
                  </template>
                  <template v-else>
                    <template v-if="row.type === 'boolean'">
                      <el-radio-group v-model="row.defaultValue" size="small">
                        <el-radio-button :value="false">正常</el-radio-button>
                        <el-radio-button :value="true">禁用</el-radio-button>
                      </el-radio-group>
                    </template>
                    <template v-else-if="row.type === 'number'">
                      <el-input-number v-model="row.defaultValue" :min="0" style="width: 100%" />
                    </template>
                    <template v-else>
                      <el-input v-model="row.defaultValue" placeholder="输入默认值" />
                    </template>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="数据类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'string' ? 'info' : row.type === 'boolean' ? 'warning' : 'success'" size="small">
                    {{ row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="是否必填" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.required" type="danger" size="small">必填</el-tag>
                  <span v-else class="text-slate-400">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="mb-4">
            <div class="text-sm font-semibold text-slate-700 mb-3">数据预览 (前3条)</div>
            <el-table :data="previewData" border style="width: 100%" size="small">
              <el-table-column v-for="field in previewFields" :key="field" :label="field" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row[field] }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        
        <template v-else-if="batchStep === 3">
          <div class="mb-4">
            <el-alert
              :title="`准备导入 ${validatedData.length} 条记录`"
              type="info"
              show-icon
              class="mb-4"
            />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <el-card>
                <template #header>
                  <div class="flex justify-between items-center">
                    <span class="font-medium">字段映射</span>
                  </div>
                </template>
                <div class="space-y-2">
                  <div v-for="map in fieldMapping" :key="map.targetField" class="flex justify-between text-sm">
                    <span class="text-slate-600">{{ map.targetFieldLabel }}</span>
                    <span class="font-medium">
                      {{ map.configMode === 'default' && !map.required 
                        ? `默认值: ${map.type === 'boolean' ? (map.defaultValue ? '禁用' : '正常') : map.defaultValue}`
                        : (map.sourceField || '(不映射)') 
                      }}
                    </span>
                  </div>
                </div>
              </el-card>
              
              <el-card>
                <template #header>
                  <div class="flex justify-between items-center">
                    <span class="font-medium">统计信息</span>
                  </div>
                </template>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">总记录数</span>
                    <span class="font-medium">{{ rawData.length }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">有效记录</span>
                    <span class="font-medium text-green-600">{{ validatedData.length }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">无效记录</span>
                    <span class="font-medium text-red-600">{{ validationErrors.length }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">目标分类</span>
                    <span class="font-medium">{{ getCategoryName(batchCategoryId) }}</span>
                  </div>
                </div>
              </el-card>
            </div>
            
            <div v-if="validationErrors.length > 0">
              <div class="text-sm font-semibold text-slate-700 mb-2">验证错误</div>
              <el-table :data="validationErrors" border style="width: 100%" size="small">
                <el-table-column label="索引" prop="index" width="80" />
                <el-table-column label="错误信息" prop="message" show-overflow-tooltip />
              </el-table>
            </div>
          </div>
        </template>
        
        <template v-else-if="batchStep === 4">
          <div class="mb-4">
            <el-alert
              :title="`导入完成！`"
              type="success"
              :closable="false"
              show-icon
              class="mb-4"
            />
            
            <el-progress
              :percentage="importProgress"
              :status="importProgress === 100 ? 'success' : undefined"
              class="mb-6"
            />
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <el-card>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ batchResult.success_count || 0 }}</div>
                  <div class="text-sm text-slate-600 mt-1">成功</div>
                </div>
              </el-card>
              <el-card>
                <div class="text-center">
                  <div class="text-2xl font-bold text-amber-600">{{ (batchResult.db_duplicates?.length || 0) + (batchResult.internal_duplicates?.length || 0) }}</div>
                  <div class="text-sm text-slate-600 mt-1">重复</div>
                </div>
              </el-card>
              <el-card>
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">{{ batchResult.failed_count || 0 }}</div>
                  <div class="text-sm text-slate-600 mt-1">失败</div>
                </div>
              </el-card>
            </div>
            
            <el-collapse v-if="batchResult.db_duplicates?.length > 0 || batchResult.internal_duplicates?.length > 0 || batchResult.failed?.length > 0">
              <el-collapse-item v-if="batchResult.db_duplicates?.length > 0" title="数据库重复">
                <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
                  <div v-for="(item, index) in batchResult.db_duplicates" :key="index" class="text-sm text-slate-600 py-1 border-b border-slate-200 last:border-0">
                    {{ item }}
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="batchResult.internal_duplicates?.length > 0" title="内部重复">
                <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
                  <div v-for="(item, index) in batchResult.internal_duplicates" :key="index" class="text-sm text-slate-600 py-1 border-b border-slate-200 last:border-0">
                    {{ item }}
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="batchResult.failed?.length > 0" title="失败记录">
                <el-table :data="batchResult.failed" border style="width: 100%" size="small">
                  <el-table-column label="内容" prop="content" show-overflow-tooltip />
                  <el-table-column label="错误" prop="error" show-overflow-tooltip />
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <div>
            <el-button v-if="batchStep > 1 && batchStep < 4" @click="prevStep" class="transition-all duration-200 hover:scale-105">上一步</el-button>
          </div>
          <div class="flex gap-3">
            <el-button @click="showBatchDialog = false; resetBatchForm()" class="transition-all duration-200 hover:scale-105">
              {{ batchStep === 4 ? '关闭' : '取消' }}
            </el-button>
            <el-button v-if="batchStep === 1" type="primary" @click="nextStep" :loading="batchLoading" class="transition-all duration-200 hover:scale-105">下一步</el-button>
            <el-button v-else-if="batchStep === 2" type="primary" @click="nextStep" :loading="batchLoading" class="transition-all duration-200 hover:scale-105">下一步</el-button>
            <el-button v-else-if="batchStep === 3" type="primary" @click="startImport" :loading="batchLoading" class="transition-all duration-200 hover:scale-105" :disabled="validatedData.length === 0">开始导入</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Upload,
  DArrowLeft,
  DArrowRight,
  ArrowLeft,
  ArrowRight,
  Delete,
  Operation,
  Check,
  Close,
  ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSentence, deleteSentence, updateSentence, getPaginatedSentences, getCategories, batchDeleteSentences, batchUpdateSentenceStatus } from '@/api/sentence'
import type { FormInstance, FormRules } from 'element-plus'

const isMobile = ref(false)
const showDialog = ref(false)
const showBatchDialog = ref(false)
const batchStep = ref(1)
const sentences = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const batchLoading = ref(false)
const batchDeleteLoading = ref(false)
const batchStatusLoading = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const tableRef = ref<any>(null)
const selectedCategory = ref('all')
const batchCategoryId = ref('')
const batchDataStr = ref('')
const batchParseError = ref('')
const rawData = ref<any[]>([])
const availableFields = ref<string[]>([])
const importProgress = ref(0)

interface FieldMappingItem {
  targetField: string
  targetFieldLabel: string
  sourceField: string
  type: string
  required: boolean
  configMode: 'map' | 'default'
  defaultValue: any
}

const fieldMapping = ref<FieldMappingItem[]>([
  { targetField: 'content', targetFieldLabel: '内容', sourceField: 'content', type: 'string', required: true, configMode: 'map', defaultValue: '' },
  { targetField: 'from_source', targetFieldLabel: '来源', sourceField: 'from_source', type: 'string', required: false, configMode: 'map', defaultValue: '' },
  { targetField: 'from_who', targetFieldLabel: '作者', sourceField: 'from_who', type: 'string', required: false, configMode: 'map', defaultValue: '' },
  { targetField: 'is_disabled', targetFieldLabel: '是否禁用', sourceField: 'is_disabled', type: 'boolean', required: false, configMode: 'default', defaultValue: false },
  { targetField: 'likes', targetFieldLabel: '点赞数', sourceField: 'likes', type: 'number', required: false, configMode: 'default', defaultValue: 0 }
])

const validatedData = ref<any[]>([])
const validationErrors = ref<{ index: number; message: string }[]>([])
const batchResult = ref<any>({
  success_count: 0,
  internal_duplicates: [],
  db_duplicates: [],
  failed_count: 0,
  failed: []
})
const selectedSentenceIds = ref<string[]>([])
const selectedSentences = ref<any[]>([])

const previewData = computed(() => rawData.value.slice(0, 3))

const previewFields = computed(() => {
  const fields = new Set<string>()
  rawData.value.slice(0, 3).forEach(item => {
    Object.keys(item).forEach(key => fields.add(key))
  })
  return Array.from(fields)
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const jumpPage = ref(1)

const form = reactive({
  content: '',
  category_id: '',
  from_source: '',
  from_who: '',
  is_disabled: false,
  likes: 0
})

const totalPages = computed(() => {
  if (total.value === 0) return 1
  return Math.ceil(total.value / pageSize.value)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPage.value
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
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

const handleSelectionChange = (selection: any[]) => {
  selectedSentenceIds.value = selection.map(item => item.id)
  selectedSentences.value = [...selection]
}

const clearSelection = () => {
  selectedSentenceIds.value = []
  selectedSentences.value = []
  tableRef.value?.clearSelection()
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
  jumpPage.value = 1
  loadSentences()
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) {
    return
  }
  currentPage.value = page
  jumpPage.value = page
  loadSentences()
}

const handleSizeChange = () => {
  currentPage.value = 1
  jumpPage.value = 1
  loadSentences()
}

const handleJump = () => {
  let page = jumpPage.value
  if (page < 1) {
    page = 1
  } else if (page > totalPages.value) {
    page = totalPages.value
  }
  goToPage(page)
}

const loadSentences = async () => {
  try {
    loading.value = true
    const response = await getPaginatedSentences({
      category_id: selectedCategory.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    sentences.value = response.data.items
    total.value = response.data.total
    
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
      jumpPage.value = totalPages.value
      await loadSentences()
    }
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

const nextStep = async () => {
  if (batchStep.value === 1) {
    if (!batchCategoryId.value) {
      ElMessage.error('请选择分类')
      return
    }
    if (!batchDataStr.value.trim()) {
      ElMessage.error('请粘贴数据')
      return
    }
    try {
      batchLoading.value = true
      batchParseError.value = ''
      const data = JSON.parse(batchDataStr.value)
      if (!Array.isArray(data)) {
        batchParseError.value = '数据格式错误：必须是数组格式'
        return
      }
      if (data.length === 0) {
        batchParseError.value = '数据不能为空'
        return
      }
      rawData.value = data
      const fields = new Set<string>()
      data.forEach(item => {
        Object.keys(item).forEach(key => fields.add(key))
      })
      availableFields.value = Array.from(fields)
      fieldMapping.value.forEach(map => {
        if (availableFields.value.includes(map.sourceField)) return
        const alternatives = {
          content: ['content', 'sentence', 'text'],
          from_source: ['from_source', 'source'],
          from_who: ['from_who', 'author', 'who'],
          is_disabled: ['is_disabled', 'disabled', 'isDisabled'],
          likes: ['likes', 'like', 'like_count']
        }
        const altFields = alternatives[map.targetField as keyof typeof alternatives]
        if (altFields) {
          const found = altFields.find(f => availableFields.value.includes(f))
          if (found) map.sourceField = found
        }
      })
      batchStep.value = 2
    } catch (error: any) {
      console.error('解析数据失败:', error)
      if (error instanceof SyntaxError) {
        batchParseError.value = 'JSON格式错误，请检查数据格式'
      } else {
        batchParseError.value = error.message || '解析数据失败'
      }
    } finally {
      batchLoading.value = false
    }
  } else if (batchStep.value === 2) {
    const contentMap = fieldMapping.value.find(m => m.targetField === 'content')
    if (!contentMap?.sourceField) {
      ElMessage.error('必须映射内容字段')
      return
    }
    validateData()
    batchStep.value = 3
  }
}

const prevStep = () => {
  if (batchStep.value > 1) {
    batchStep.value--
  }
}

const validateData = () => {
  validatedData.value = []
  validationErrors.value = []
  
  rawData.value.forEach((item, index) => {
    const errors: string[] = []
    const mappedItem: any = {
      category_id: batchCategoryId.value
    }
    
    fieldMapping.value.forEach(map => {
      if (map.configMode === 'default' && !map.required) {
        mappedItem[map.targetField] = map.defaultValue
        return
      }
      
      if (!map.sourceField) {
        if (map.required) {
          errors.push(`${map.targetFieldLabel} 是必填项`)
        }
        return
      }
      
      const value = item[map.sourceField]
      
      if (map.required && (value === undefined || value === null || value === '')) {
        errors.push(`${map.targetFieldLabel} 是必填项`)
        return
      }
      
      if (value === undefined || value === null || value === '') {
        if (map.type === 'string') mappedItem[map.targetField] = ''
        else if (map.type === 'number') mappedItem[map.targetField] = 0
        else if (map.type === 'boolean') mappedItem[map.targetField] = false
        return
      }
      
      try {
        if (map.type === 'string') {
          mappedItem[map.targetField] = String(value)
        } else if (map.type === 'number') {
          const num = Number(value)
          if (isNaN(num)) {
            errors.push(`${map.targetFieldLabel} 必须是数字`)
          } else {
            mappedItem[map.targetField] = num
          }
        } else if (map.type === 'boolean') {
          if (typeof value === 'boolean') {
            mappedItem[map.targetField] = value
          } else if (typeof value === 'string') {
            mappedItem[map.targetField] = value.toLowerCase() === 'true' || value === '1'
          } else if (typeof value === 'number') {
            mappedItem[map.targetField] = value === 1
          } else {
            mappedItem[map.targetField] = Boolean(value)
          }
        }
      } catch (e) {
        errors.push(`${map.targetFieldLabel} 数据类型转换失败`)
      }
    })
    
    if (errors.length > 0) {
      validationErrors.value.push({
        index: index + 1,
        message: errors.join('; ')
      })
    } else {
      validatedData.value.push(mappedItem)
    }
  })
}

const startImport = async () => {
  if (validatedData.value.length === 0) {
    ElMessage.error('没有有效的数据可导入')
    return
  }
  
  try {
    batchLoading.value = true
    importProgress.value = 0
    
    batchStep.value = 4
    
    const response = await createSentence(validatedData.value)
    
    importProgress.value = 100
    
    batchResult.value = response.data || {
      success_count: 0,
      internal_duplicates: [],
      db_duplicates: [],
      failed_count: 0,
      failed: []
    }
    
    await loadSentences()
  } catch (error: any) {
    console.error('批量导入失败:', error)
    batchResult.value = {
      success_count: 0,
      internal_duplicates: [],
      db_duplicates: [],
      failed_count: validatedData.value.length,
      failed: validatedData.value.map((item) => ({
        content: item.content,
        error: error.message || '导入失败'
      }))
    }
    ElMessage.error(error.message || '批量导入失败')
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

const handleBatchStatusChange = async (command: string) => {
  if (selectedSentences.value.length === 0) {
    ElMessage.warning('请先选择要操作的句子')
    return
  }

  const isDisabled = command === 'disable'
  const actionText = isDisabled ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}选中的 ${selectedSentences.value.length} 项数据吗？`,
      `批量${actionText}确认`,
      {
        confirmButtonText: `确定${actionText}`,
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchStatusLoading.value = true
    await batchUpdateSentenceStatus(selectedSentences.value, isDisabled)
    ElMessage.success(`成功${actionText} ${selectedSentences.value.length} 项数据`)
    clearSelection()
    await loadSentences()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`批量${actionText}失败:`, error)
      ElMessage.error(error.message || `批量${actionText}失败，请重试`)
    }
  } finally {
    batchStatusLoading.value = false
  }
}

const handleBatchDelete = async () => {
  if (selectedSentenceIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的句子')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedSentenceIds.value.length} 项数据吗？此操作不可撤销`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchDeleteLoading.value = true
    await batchDeleteSentences(selectedSentenceIds.value)
    ElMessage.success(`成功删除 ${selectedSentenceIds.value.length} 项数据`)
    clearSelection()
    await loadSentences()
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
  form.content = ''
  form.category_id = ''
  form.from_source = ''
  form.from_who = ''
  form.is_disabled = false
  form.likes = 0
  formRef.value?.clearValidate()
}

const resetBatchForm = () => {
  batchStep.value = 1
  batchCategoryId.value = ''
  batchDataStr.value = ''
  batchParseError.value = ''
  rawData.value = []
  availableFields.value = []
  importProgress.value = 0
  validatedData.value = []
  validationErrors.value = []
  batchResult.value = {
    success_count: 0,
    internal_duplicates: [],
    db_duplicates: [],
    failed_count: 0,
    failed: []
  }
  fieldMapping.value = [
    { targetField: 'content', targetFieldLabel: '内容', sourceField: 'content', type: 'string', required: true, configMode: 'map', defaultValue: '' },
    { targetField: 'from_source', targetFieldLabel: '来源', sourceField: 'from_source', type: 'string', required: false, configMode: 'map', defaultValue: '' },
    { targetField: 'from_who', targetFieldLabel: '作者', sourceField: 'from_who', type: 'string', required: false, configMode: 'map', defaultValue: '' },
    { targetField: 'is_disabled', targetFieldLabel: '是否禁用', sourceField: 'is_disabled', type: 'boolean', required: false, configMode: 'default', defaultValue: false },
    { targetField: 'likes', targetFieldLabel: '点赞数', sourceField: 'likes', type: 'number', required: false, configMode: 'default', defaultValue: 0 }
  ]
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

.pagination-container {
  background: linear-gradient(to bottom, transparent, rgba(248, 250, 252, 0.5));
  padding: 1.5rem 1rem;
  border-radius: 1rem;
}

.pagination-info {
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-btn {
  transition: all 0.2s ease !important;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-page-btn {
  min-width: 2.5rem;
  transition: all 0.2s ease !important;
}

.pagination-page-btn:hover:not(.is-active):not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.pagination-page-btn.is-active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.pagination-jump {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .pagination-container {
    padding: 1rem 0.5rem;
  }
  
  .pagination-info {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .pagination-controls {
    gap: 0.25rem;
  }
  
  .pagination-page-btn {
    min-width: 2rem;
    font-size: 0.875rem;
  }
  
  .pagination-jump {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .pagination-page-btn {
    min-width: 1.75rem;
    padding: 0.25rem 0.375rem;
  }
  
  .pagination-btn {
    padding: 0.25rem 0.5rem;
  }
}
</style>
