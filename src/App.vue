<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Layout from './layout/index.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.path === '/login')
const isInitializing = computed(() => authStore.isInitializing)

onMounted(async () => {
  const isValid = await authStore.verifyToken()
  if (!isValid && route.meta.requiresAuth !== false) {
    router.replace('/login')
  }
})
</script>

<template>
  <div v-if="isInitializing" class="loading-container">
    <span>加载中...</span>
  </div>
  <template v-else>
    <Layout v-if="!isLoginPage" />
    <router-view v-else />
  </template>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
