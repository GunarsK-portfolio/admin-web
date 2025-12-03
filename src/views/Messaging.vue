<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header
        title="Messaging Management"
        subtitle="Manage contact form recipients and view messages"
      />

      <n-tabs type="line" animated default-value="recipients">
        <n-tab-pane name="recipients" tab="Recipients">
          <MessagingRecipients />
        </n-tab-pane>

        <n-tab-pane name="messages" tab="Messages">
          <MessagingMessages />
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </div>
</template>

<script setup>
import { NSpace, NPageHeader, NTabs, NTabPane } from 'naive-ui'
import BackButton from '../components/shared/BackButton.vue'
import MessagingRecipients from '../components/messaging/MessagingRecipients.vue'
import MessagingMessages from '../components/messaging/MessagingMessages.vue'
</script>
