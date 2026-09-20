<script setup lang="ts">
defineProps<{
  type: 'info' | 'success' | 'error'
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-w-[320px]">
    <div 
      class="flex items-center justify-center w-14 h-14 rounded-2xl border-[2.5px] shrink-0"
      :class="{
        'border-[#2F4DC4] text-[#2F4DC4]': type === 'info',
        'border-[#5FC48C] text-[#5FC48C]': type === 'success',
        'border-[#E45C5F] text-[#E45C5F]': type === 'error'
      }"
    >
      <svg v-if="type === 'info'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 11v5m0 0v2m0-2h2m-2 0h-2m2-9.5V8m0 0h.01" />
      </svg>
      <svg v-else-if="type === 'success'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else-if="type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>

    <div 
      class="border-l-[1.5px] pl-4 flex flex-col justify-center h-14"
      :class="{
        'border-[#2F4DC4]': type === 'info',
        'border-[#5FC48C]': type === 'success',
        'border-[#E45C5F]': type === 'error'
      }"
    >
      <h3 class="text-[19px] font-bold text-gray-900 leading-tight">{{ title }}</h3>
      <p class="text-[13px] font-medium italic text-gray-600 mt-0.5 uppercase">{{ subtitle }}</p>
    </div>
  </div>
</template>
