<template>
  <n-space vertical align="center" justify="center" style="min-height: 100vh; padding: 24px">
    <div style="text-align: center; margin-bottom: 32px">
      <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 16px">Portfolio Admin</h1>
      <p style="font-size: 16px">Sign in to manage your portfolio content</p>
    </div>

    <n-card style="width: 100%; max-width: 400px">
      <n-form @submit.prevent="handleLogin">
        <n-form-item label="Username">
          <n-input
            v-model:value="username"
            placeholder="username"
            :disabled="loading"
            @keydown.enter.prevent="handleLogin"
          />
        </n-form-item>

        <n-form-item label="Password">
          <n-input
            v-model:value="password"
            type="password"
            placeholder="password"
            :disabled="loading"
            @keydown.enter.prevent="handleLogin"
          />
        </n-form-item>

        <n-alert v-if="error" type="error" style="margin-bottom: 16px">
          {{ error }}
        </n-alert>

        <n-button
          type="primary"
          block
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </n-button>
      </n-form>
    </n-card>
  </n-space>
</template>

<script setup>
import { ref } from 'vue'
import { NSpace, NCard, NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const success = await authStore.login(username.value, password.value)

  if (!success) {
    error.value = 'Invalid username or password'
  }

  loading.value = false
}
</script>
