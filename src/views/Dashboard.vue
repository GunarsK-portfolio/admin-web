<template>
  <div class="min-h-screen bg-base-100">
    <div class="navbar bg-base-200 shadow-lg">
      <div class="navbar-start">
        <h1 class="text-xl font-bold">Portfolio Admin</h1>
      </div>
      <div class="navbar-end">
        <button @click="authStore.logout()" class="btn btn-ghost">Logout</button>
      </div>
    </div>

    <div class="container mx-auto p-6">
      <h2 class="text-3xl font-bold mb-6">Content Management</h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Profile</h3>
            <p>Manage your personal information and bio</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm">Edit Profile</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Work Experience</h3>
            <p>Add, edit, or remove work experience entries</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm">Manage</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Certifications</h3>
            <p>Manage your professional certifications</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm">Manage</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Miniature Projects</h3>
            <p>Add and manage your miniature painting projects</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm">Manage</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Images</h3>
            <p>Upload and manage project images</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm">Upload</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>This is a basic admin dashboard. Full CRUD functionality can be implemented by creating dedicated management pages for each content type.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>
