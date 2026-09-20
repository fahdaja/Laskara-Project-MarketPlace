<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: '480px',
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Modal Content -->
        <div
          class="relative bg-warm-white rounded-2xl shadow-2xl w-full overflow-hidden animate-modal-in"
          :style="{ maxWidth }"
        >
          <!-- Header -->
          <div
            v-if="title"
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
          >
            <h3 class="text-body-lg font-semibold text-gray-800">{{ title }}</h3>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modalIn 0.25s ease-out;
}
</style>
