<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col">
      <div class="text-center">
        <h1 class="text-5xl font-bold">Portfolio Admin</h1>
        <p class="py-6">Sign in to manage your portfolio content</p>
      </div>
      <div class="card w-full max-w-sm shadow-2xl bg-base-100">
        <form @submit.prevent="handleLogin" class="card-body">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="username"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="password"
              class="input input-bordered"
              required
            />
          </div>
          <div v-if="error" class="alert alert-error">
            <span>{{ error }}</span>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
