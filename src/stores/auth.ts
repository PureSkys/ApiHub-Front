import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { getCurrentUser } from '@/api/user'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isInitializing = ref(true)

  const verifyToken = async () => {
    const token = storage.getToken()

    if (!token) {
      isAuthenticated.value = false
      isInitializing.value = false
      return false
    }

    try {
      await getCurrentUser()
      isAuthenticated.value = true
      isInitializing.value = false
      return true
    } catch (error) {
      storage.removeToken()
      isAuthenticated.value = false
      isInitializing.value = false
      return false
    }
  }

  const logout = () => {
    storage.removeToken()
    isAuthenticated.value = false
    router.push('/login')
  }

  const setAuthenticated = (value: boolean) => {
    isAuthenticated.value = value
  }

  return {
    isAuthenticated,
    isInitializing,
    verifyToken,
    logout,
    setAuthenticated
  }
})
