<template>
  <n-modal v-model:show="isVisible" preset="card" :title="title" style="width: 600px">
    <n-space vertical :size="16">
      <div class="cropper-wrapper">
        <Cropper
          v-if="imageSrc"
          ref="cropperRef"
          :key="imageSrc"
          class="cropper"
          :src="imageSrc"
          :stencil-props="{
            aspectRatio: aspectRatio,
          }"
          :stencil-component="stencilComponent"
          :default-size="{
            width: 300,
            height: 300,
          }"
          :min-width="100"
          :min-height="100"
          image-restriction="fit-area"
        />
      </div>

      <n-space justify="end">
        <n-button @click="handleCancel">Cancel</n-button>
        <n-button type="primary" :loading="uploading" @click="handleCrop">
          {{ confirmText }}
        </n-button>
      </n-space>
    </n-space>
  </n-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { NModal, NSpace, NButton } from 'naive-ui'
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Crop Image',
  },
  confirmText: {
    type: String,
    default: 'Upload Image',
  },
  aspectRatio: {
    type: Number,
    default: 1, // 1:1 for square/circle, 16/9 for landscape, 4/3 for standard photo
  },
  circular: {
    type: Boolean,
    default: false, // Use circular stencil for avatars
  },
  outputFormat: {
    type: String,
    default: 'image/jpeg', // or 'image/png'
  },
  outputQuality: {
    type: Number,
    default: 0.9, // 0.0 to 1.0
  },
})

const emit = defineEmits(['update:show', 'crop', 'cancel'])

const isVisible = ref(props.show)
const cropperRef = ref(null)
const uploading = ref(false)

const stencilComponent = computed(() => {
  return props.circular ? CircleStencil : RectangleStencil
})

watch(
  () => props.show,
  (newVal) => {
    isVisible.value = newVal
  }
)

watch(isVisible, (newVal) => {
  emit('update:show', newVal)
})

const handleCancel = () => {
  isVisible.value = false
  emit('cancel')
}

const handleCrop = async () => {
  if (!cropperRef.value) return

  uploading.value = true
  try {
    const { canvas } = cropperRef.value.getResult()

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        emit('crop', blob)
        uploading.value = false
      },
      props.outputFormat,
      props.outputQuality
    )
  } catch (error) {
    uploading.value = false
    console.error('Failed to crop image:', error)
  }
}
</script>

<style scoped>
.cropper-wrapper {
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.cropper {
  height: 100%;
  width: 100%;
}

html.dark .cropper-wrapper {
  background: #2d2d2d;
}
</style>
