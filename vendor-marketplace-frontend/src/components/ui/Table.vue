<script setup lang="ts">
export interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  emptyMessage: 'Tidak ada data tersedia.',
})
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
    <table class="w-full text-body-sm">
      <thead>
        <tr class="bg-gradient-to-r from-brand-blue to-brand-navy">
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
            :class="[
              'px-5 py-3.5 text-white font-semibold tracking-wide',
              {
                'text-left': col.align === 'left' || !col.align,
                'text-center': col.align === 'center',
                'text-right': col.align === 'right',
              },
            ]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="(row, index) in data"
          :key="index"
          class="hover:bg-brand-lighter/10 transition-colors duration-150"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-5 py-3.5',
              {
                'text-left': col.align === 'left' || !col.align,
                'text-center': col.align === 'center',
                'text-right': col.align === 'right',
              },
            ]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-5 py-10 text-center text-gray-400">
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
