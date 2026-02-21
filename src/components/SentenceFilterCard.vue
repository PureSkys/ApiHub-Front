<template>
  <div class="filter-card">
    <div class="filter-card-content">
      <div v-if="selectedSentenceIds.length > 0" class="batch-actions-bar">
        <div class="selection-info">
          <el-icon class="text-indigo-500"><Select /></el-icon>
          <span class="text-slate-700 font-medium">已选择 <span class="text-indigo-600 text-lg font-bold">{{ selectedSentenceIds.length }}</span> 项</span>
        </div>
        <div class="batch-buttons flex items-center gap-3 flex-wrap">
          <el-dropdown @command="handleBatchStatusChange">
            <el-button type="primary" :loading="batchStatusLoading" class="filter-btn-primary">
              <el-icon><Operation /></el-icon>
              批量操作
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="filter-dropdown-menu">
                <el-dropdown-item command="enable" class="filter-dropdown-item">
                  <el-icon class="mr-2 text-green-500"><Check /></el-icon>
                  启用
                </el-dropdown-item>
                <el-dropdown-item command="disable" class="filter-dropdown-item">
                  <el-icon class="mr-2 text-red-500"><Close /></el-icon>
                  禁用
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            type="danger"
            @click="handleBatchDelete"
            :loading="batchDeleteLoading"
            class="filter-btn-danger"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button @click="clearSelection" class="filter-btn-default">
            取消选择
          </el-button>
        </div>
      </div>
      
      <div v-else class="filter-controls">
        <div class="search-section">
          <div class="search-container">
            <el-input
              v-model="localSearchQuery"
              placeholder="搜索句子..."
              :prefix-icon="Search"
              :clearable="true"
              @input="handleSearchInput"
              @clear="clearSearch"
              @keyup.enter="performSearch"
              class="search-input"
              size="large"
            />
          </div>
        </div>
        
        <div class="filters-section">
          <div class="filter-group">
            <div class="filter-group-label">
              <el-icon><Folder /></el-icon>
              分类
            </div>
            <el-select v-model="localSelectedCategory" placeholder="选择分类" class="filter-select category-filter" size="large" @change="handleCategoryChange">
              <el-option label="全部" value="all" />
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.category" :value="String(cat.id)" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <div class="filter-group-label status-label">
              <el-icon><CircleCheck /></el-icon>
              状态
            </div>
            <el-select v-model="localSelectedStatus" placeholder="选择状态" class="filter-select status-filter" size="large" @change="handleStatusChange">
              <el-option label="全部" value="all" />
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </div>
          
          <Transition name="filter-btn">
            <el-button 
              v-if="hasActiveFilters" 
              type="danger" 
              @click="clearAllFilters" 
              class="clear-filters-btn" 
              size="large"
            >
              <el-icon><Delete /></el-icon>
              清除筛选
            </el-button>
          </Transition>
        </div>
        
        <div class="action-section">
          <el-button @click="showBatchImport" class="filter-btn-default" size="large">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button type="primary" @click="showAddDialog" class="filter-btn-primary" size="large">
            <el-icon><Plus /></el-icon>
            添加句子
          </el-button>
        </div>
      </div>
      
      <Transition name="filter-bar">
        <div v-if="hasActiveFilters" class="active-filters-bar">
          <div class="active-filters-header">
            <span class="active-filters-title">
              <el-icon><Filter /></el-icon>
              当前筛选条件
            </span>
            <el-button 
              type="danger" 
              text 
              size="small" 
              @click="clearAllFilters"
              class="clear-all-btn"
            >
              <el-icon class="mr-1"><RefreshLeft /></el-icon>
              清除全部
            </el-button>
          </div>
          <div class="filter-tags">
            <div 
              v-for="(filter, index) in activeFiltersList" 
              :key="index"
              class="filter-chip"
              @click="removeFilter(filter.type)"
            >
              <el-icon class="filter-chip-icon" :color="filter.color">
                <component :is="filter.icon" />
              </el-icon>
              <span class="filter-chip-text">{{ filter.label }}</span>
              <el-icon class="filter-chip-close"><Close /></el-icon>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Plus,
  Upload,
  Delete,
  Operation,
  Check,
  Close,
  ArrowDown,
  Search,
  Select,
  Filter,
  Folder,
  CircleCheck,
  RefreshLeft
} from '@element-plus/icons-vue'

interface Props {
  categories: any[]
  selectedCategory: string
  selectedStatus: string
  searchQuery: string
  selectedSentenceIds: string[]
  hasActiveFilters: boolean
  batchStatusLoading: boolean
  batchDeleteLoading: boolean
}

interface Emits {
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:selectedStatus', value: string): void
  (e: 'update:searchQuery', value: string): void
  (e: 'search-input', value: string): void
  (e: 'perform-search'): void
  (e: 'clear-search'): void
  (e: 'category-change'): void
  (e: 'status-change'): void
  (e: 'clear-all-filters'): void
  (e: 'show-batch-import'): void
  (e: 'show-add-dialog'): void
  (e: 'batch-status-change', command: string): void
  (e: 'batch-delete'): void
  (e: 'clear-selection'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

let searchDebounceTimer: any = null

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value)
})

const localSelectedCategory = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value)
})

const localSelectedStatus = computed({
  get: () => props.selectedStatus,
  set: (value) => emit('update:selectedStatus', value)
})

const handleSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    emit('search-input', localSearchQuery.value)
  }, 300)
}

const performSearch = () => {
  emit('perform-search')
}

const clearSearch = () => {
  emit('clear-search')
}

const handleCategoryChange = () => {
  emit('category-change')
}

const handleStatusChange = () => {
  emit('status-change')
}

const clearAllFilters = () => {
  emit('clear-all-filters')
}

const showBatchImport = () => {
  emit('show-batch-import')
}

const showAddDialog = () => {
  emit('show-add-dialog')
}

const handleBatchStatusChange = (command: string) => {
  emit('batch-status-change', command)
}

const handleBatchDelete = () => {
  emit('batch-delete')
}

const clearSelection = () => {
  emit('clear-selection')
}

const activeFiltersList = computed(() => {
  const filters: any[] = []
  
  if (props.selectedCategory !== 'all') {
    filters.push({
      type: 'category',
      icon: Folder,
      label: `分类: ${getCategoryName(props.selectedCategory)}`,
      color: '#3b82f6'
    })
  }
  
  if (props.selectedStatus !== 'all') {
    filters.push({
      type: 'status',
      icon: CircleCheck,
      label: `状态: ${props.selectedStatus === 'active' ? '正常' : '禁用'}`,
      color: props.selectedStatus === 'active' ? '#22c55e' : '#ef4444'
    })
  }
  
  if (props.searchQuery.trim()) {
    filters.push({
      type: 'search',
      icon: Search,
      label: `搜索: ${props.searchQuery}`,
      color: '#f59e0b'
    })
  }
  
  return filters
})

const removeFilter = (type: string) => {
  if (type === 'category') {
    localSelectedCategory.value = 'all'
    handleCategoryChange()
  } else if (type === 'status') {
    localSelectedStatus.value = 'all'
    handleStatusChange()
  } else if (type === 'search') {
    localSearchQuery.value = ''
    clearSearch()
  }
}

const getCategoryName = (categoryId: any) => {
  if (!categoryId) return '-'
  const cat = props.categories.find(c => String(c.id) === String(categoryId))
  return cat ? cat.category : String(categoryId)
}
</script>

<style scoped>
.filter-card {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.filter-card-content {
  padding: 24px;
  overflow: hidden;
  border-radius: 20px;
}

.filter-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.filter-btn-primary:active {
  transform: translateY(0);
}

.filter-btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.filter-btn-default {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn-default:hover {
  border-color: #6366f1;
  color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.search-input {
  border-radius: 12px;
}

.search-input :deep(.el-input__wrapper) {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
  padding-right: 12px;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.active-filters-bar {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 16px;
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.active-filters-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.clear-all-btn {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.filter-chip-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.filter-chip-text {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.filter-chip-close {
  font-size: 12px;
  color: #94a3b8;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.filter-chip:hover .filter-chip-close {
  color: #ef4444;
}

.filter-select {
  min-width: 150px;
}

.filter-select :deep(.el-select__wrapper) {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.filter-select :deep(.el-select__wrapper:hover) {
  border-color: #cbd5e1;
}

.filter-select :deep(.el-select__wrapper.is-focused) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.category-filter :deep(.el-select__wrapper) {
  border-color: #dbeafe;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.category-filter :deep(.el-select__wrapper:hover) {
  border-color: #3b82f6;
}

.category-filter :deep(.el-select__wrapper.is-focused) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.status-filter :deep(.el-select__wrapper) {
  border-color: #f3e8ff;
  background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
}

.status-filter :deep(.el-select__wrapper:hover) {
  border-color: #a855f7;
}

.status-filter :deep(.el-select__wrapper.is-focused) {
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15);
}

.clear-filters-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-filters-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.35);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.filter-dropdown-menu {
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

.filter-dropdown-item {
  border-radius: 8px;
  padding: 10px 14px;
  margin: 2px 0;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-dropdown-item:hover {
  background: #f1f5f9;
}

.filter-card-content {
  padding: 24px;
}

.batch-actions-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.batch-buttons {
  flex: 1;
}

.filter-controls {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 20px;
  align-items: end;
}

.search-section {
  min-width: 0;
  position: relative;
  z-index: 100;
}

.search-container {
  width: 100%;
  position: relative;
}

.filters-section {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
  min-height: 48px;
}

.filter-btn-enter-active,
.filter-btn-leave-active {
  transition: all 0.3s ease;
}

.filter-btn-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.filter-btn-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.filter-bar-enter-active,
.filter-bar-leave-active {
  transition: all 0.3s ease;
}

.filter-bar-enter-from,
.filter-bar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  padding-left: 4px;
}

.status-label {
  color: #7c3aed;
}

.filter-select {
  min-width: 150px;
}

.active-filters-bar {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.active-filters-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.filter-tags {
  flex: 1;
}

.filter-tag {
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .filter-controls {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filters-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-section {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .filter-card-content {
    padding: 16px;
  }
  
  .filter-controls {
    gap: 12px;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .action-section .el-button {
    width: 100%;
  }
  
  .batch-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-buttons {
    flex-direction: column;
  }
  
  .batch-buttons .el-button {
    width: 100%;
  }
  
  .active-filters-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
