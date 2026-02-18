<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">API Hub</h1>
        <p class="text-gray-600 mt-2">欢迎回来，请登录您的账号</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="space-y-4"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            class="w-full"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            class="w-full"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <div class="flex items-center justify-between">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <a href="#" class="text-blue-600 hover:underline text-sm">忘记密码？</a>
        </div>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            class="w-full"
            size="large"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="text-center text-sm text-gray-600">
          <span>还没有账号？</span>
          <a href="#" class="text-blue-600 hover:underline ml-1">立即注册</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElIcon } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'

const router = useRouter()
const loginForm = ref<any>({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)

const loginRules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ]
})

const loginFormRef = ref<any>(null)

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const response = await login({
      username : loginForm.value.email,
      password : loginForm.value.password
    })
    
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 自定义样式 */
.space-y-4 > * {
  margin-bottom: 1rem;
}

.space-y-4 > *:last-child {
  margin-bottom: 0;
}
</style>