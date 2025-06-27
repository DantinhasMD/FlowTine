<template>
  <span :class="typeClasses" class="px-2 py-1 text-xs font-medium rounded-full">
    {{ typeLabels[type] }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../stores/tasks'

interface Props {
  type: Task['type']
}

const props = defineProps<Props>()

const typeLabels = {
  routine: 'Rotina',
  pending: 'Pendência'
}

const typeClasses = computed(() => {
  const classes = {
    routine: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  }
  return classes[props.type]
})
</script>