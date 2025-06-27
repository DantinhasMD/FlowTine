<template>
  <span :class="priorityClasses" class="px-2 py-1 text-xs font-medium rounded-full">
    {{ priorityLabels[priority] }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../stores/tasks'

interface Props {
  priority: Task['priority']
}

const props = defineProps<Props>()

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
}

const priorityClasses = computed(() => {
  const classes = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  }
  return classes[props.priority]
})
</script>