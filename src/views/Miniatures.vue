<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header
        title="Miniatures Management"
        subtitle="Manage your miniature painting projects, themes, and paint collection"
      />

      <n-tabs type="line" animated default-value="projects">
        <!-- Projects Tab (default) -->
        <n-tab-pane name="projects" tab="Projects">
          <MiniaturesProjects />
        </n-tab-pane>

        <!-- Themes Tab -->
        <n-tab-pane name="themes" tab="Themes">
          <MiniaturesThemes />
        </n-tab-pane>

        <!-- Paints Tab -->
        <n-tab-pane name="paints" tab="Paints">
          <MiniaturesPaints />
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </div>
</template>

<script setup>
import { NSpace, NPageHeader, NTabs, NTabPane } from 'naive-ui'
import BackButton from '../components/shared/BackButton.vue'
import MiniaturesProjects from '../components/miniatures/MiniaturesProjects.vue'
import MiniaturesThemes from '../components/miniatures/MiniaturesThemes.vue'
import MiniaturesPaints from '../components/miniatures/MiniaturesPaints.vue'
</script>
