import apiClient from './index'

// 创建分类请求体
interface CreateAndUpdateCategoryRequest {
  category: string
  description?: string
}
// 创建句子请求体
interface CreateAndUpdateSentenceRequest {
  category_id: string
  is_disabled: boolean
  content: string
  from_source: string
  from_who: string
  likes: number
}
// 查询句子响应体
interface GetSentencesResponse {
  id: string
  sentence?: string
  content?: string
  category_id: string
  created_at: string
  updated_at: string
  is_disabled?: boolean
}
// 分页查询句子响应体
interface PaginatedSentencesResponse {
  items: GetSentencesResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
// 查询分类响应体
interface GetCategoriesResponse {
  id: string
  category: string
  description?: string
  created_at: string
  updated_at: string
}

// 创建分类API
export const createCategory = (data: CreateAndUpdateCategoryRequest) => {
  return apiClient.post('/sentence/category', data)
}
// 删除分类API
export const deleteCategory = (_id: string) => {
  return apiClient.delete(`/sentence/category/${_id}`)
}
// 批量删除分类API
export const batchDeleteCategories = (ids: string[]) => {
  return Promise.all(ids.map(id => deleteCategory(id)))
}
// 更新分类API
export const updateCategory = (_id: string, data: CreateAndUpdateCategoryRequest) => {
  return apiClient.put(`/sentence/category/${_id}`, data)
}
// 查询分类API
export const getCategories = () => {
  return apiClient.get<GetCategoriesResponse[]>('/sentence/category')
}
// 创建句子API
export const createSentence = (data: CreateAndUpdateSentenceRequest | CreateAndUpdateSentenceRequest[]) => {
  return apiClient.post('/sentence/', data)
}
// 删除句子API
export const deleteSentence = (_id: string) => {
  return apiClient.delete(`/sentence/${_id}`)
}
// 批量删除句子API
export const batchDeleteSentences = (ids: string[]) => {
  return Promise.all(ids.map(id => deleteSentence(id)))
}
// 批量更新句子状态API - 与 updateSentence 保持一致的调用方式
export const batchUpdateSentenceStatus = (sentences: any[], isDisabled: boolean) => {
  return Promise.all(sentences.map(sentence => {
    const data: CreateAndUpdateSentenceRequest = {
      content: sentence.sentence || sentence.content || '',
      category_id: sentence.category_id,
      is_disabled: isDisabled,
      from_source: sentence.from_source || '',
      from_who: sentence.from_who || '',
      likes: sentence.likes || 0
    }
    return apiClient.put(`/sentence/${sentence.id}`, data)
  }))
}
// 更新句子API
export const updateSentence = (_id: string, data: CreateAndUpdateSentenceRequest) => {
  return apiClient.put(`/sentence/${_id}`, data)
}
// 查询句子API
export const getSentences = (category_id: string = 'all', limit: number = 10) => {
  // 确保 limit 在 1~20 之间
  limit = Math.max(1, Math.min(20, limit))
  return apiClient.get<GetSentencesResponse[]>(`/sentence/${category_id}?limit=${limit}`)
}
// 分页查询句子API
export const getPaginatedSentences = (params: {
  category_id?: string
  page?: number
  page_size?: number
}) => {
  const queryParams = new URLSearchParams()
  if (params.category_id && params.category_id !== 'all') {
    queryParams.append('category_id', params.category_id)
  }
  if (params.page) {
    queryParams.append('page', params.page.toString())
  }
  if (params.page_size) {
    queryParams.append('page_size', params.page_size.toString())
  }
  const queryString = queryParams.toString()
  const url = queryString ? `/sentence/admin/paginated?${queryString}` : '/sentence/admin/paginated'
  return apiClient.get<PaginatedSentencesResponse>(url)
}
