<script setup lang="ts">
interface Props {
  label?: string
  placeholder?: string
  modelValue?: string | number
  error?: string
  required?: boolean
  id?: string
  rows?: number
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  modelValue: '',
  error: '',
  required: false,
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-body-sm font-medium text-gray-700"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      :required="required"
      :rows="rows"
      @input="onInput"
      :class="[
        'w-full px-4 py-3 rounded-lg border text-body-sm transition-all duration-200 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
        'placeholder:text-gray-400',
        error
          ? 'border-danger bg-danger-light/30'
          : 'border-brand-navy bg-white hover:border-brand-navy',
      ]"
    ></textarea>
    <p v-if="error" class="text-caption text-danger mt-0.5">{{ error }}</p>
  </div>
</template>
