const FILTER_PREFIX = 'school_filter_'

export const saveFilterState = (page: string, state: Record<string, any>) => {
  try {
    localStorage.setItem(`${FILTER_PREFIX}${page}`, JSON.stringify(state))
  } catch (e) {
    console.error('保存筛选器状态失败:', e)
  }
}

export const loadFilterState = (page: string, defaultState: Record<string, any>): Record<string, any> => {
  try {
    const saved = localStorage.getItem(`${FILTER_PREFIX}${page}`)
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('加载筛选器状态失败:', e)
  }
  return defaultState
}

export const clearFilterState = (page: string) => {
  try {
    localStorage.removeItem(`${FILTER_PREFIX}${page}`)
  } catch (e) {
    console.error('清除筛选器状态失败:', e)
  }
}
