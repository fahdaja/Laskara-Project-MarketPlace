<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-brand-navy text-white hover:bg-brand-navy/90 focus:ring-brand-navy shadow-md hover:shadow-lg': variant === 'primary',
        'bg-brand-blue text-white hover:bg-brand-blue/90 focus:ring-brand-blue': variant === 'secondary',
        'bg-danger text-white hover:bg-danger/90 focus:ring-danger': variant === 'danger',
        'bg-success text-white hover:bg-success/90 focus:ring-success': variant === 'success',
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 border border-gray-300': variant === 'ghost',
        'px-3 py-1.5 text-body-xs': size === 'sm',
        'px-5 py-2.5 text-body-sm': size === 'md',
        'px-7 py-3 text-body': size === 'lg',
        'w-full': fullWidth,
      },
    ]"
  >
    <slot />
  </button>
</template>
