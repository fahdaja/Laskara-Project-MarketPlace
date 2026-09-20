<script setup lang="ts">
interface Props {
  label?: string
  type?: string
  placeholder?: string
  modelValue?: string | number
  error?: string
  required?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  modelValue: '',
  error: '',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
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
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :required="required"
      @input="onInput"
      :class="[
        'w-full px-4 py-2.5 rounded-lg border text-body-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
        'placeholder:text-gray-400',
        error
          ? 'border-danger bg-danger-light/30'
          : 'border-gray-300 bg-white hover:border-gray-400',
      ]"
    />
    <p v-if="error" class="text-caption text-danger mt-0.5">{{ error }}</p>
  </div>
</template>
