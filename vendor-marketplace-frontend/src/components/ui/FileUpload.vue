<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

interface Props {
  accept?: string
  maxSizeMB?: number
  file?: File | null
  dragText?: string
  formatText?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/jpeg, image/png, image/webp',
  maxSizeMB: 20,
  file: null,
  dragText: 'Choose Image or drag and drop it here',
  formatText: 'JPG, PNG, and WEBP',
})

const emit = defineEmits<{
  'update:file': [file: File | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files.item(0)
    if (!file) return
    
    // Basic validation
    if (file.size > props.maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${props.maxSizeMB} MB`)
      return
    }
    selectedFile.value = file
    emit('update:file', file)
  }
}
</script>

<template>
  <div class="border-2 border-brand-navy rounded-xl p-4 bg-white">
    <div class="text-gray-600 font-medium mb-3 border-b-2 border-gray-100 pb-2">
      <slot name="label"></slot>
    </div>
    
    <div 
      class="border-2 border-dashed border-brand-blue/40 rounded-xl flex flex-col items-center justify-center py-6 px-4 bg-[#F8FAFC] cursor-pointer hover:bg-brand-blue/5 transition-colors"
      @click="triggerFileInput"
    >
      <input 
        type="file" 
        class="hidden" 
        :accept="accept" 
        @change="handleFileChange" 
        ref="fileInput" 
      />
      
      <Button variant="primary" type="button" class="mb-3 rounded-lg px-8 py-2.5 flex items-center gap-2" @click.stop="triggerFileInput">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload
      </Button>
      
      <div v-if="selectedFile" class="text-center mt-2">
        <p class="text-sm font-medium text-brand-navy truncate max-w-xs">{{ selectedFile.name }}</p>
      </div>
      <div v-else class="text-center">
        <p class="text-xs text-gray-800 font-medium">{{ dragText }}</p>
        <p class="text-[10px] text-gray-400 mt-1">{{ formatText }}. Max {{ maxSizeMB }} MB</p>
      </div>
    </div>
  </div>
</template>
