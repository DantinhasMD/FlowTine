<template>
  <span :class="effortClasses" class="px-2 py-1 text-xs font-medium rounded-full">
    {{ effortLabels[effort] }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../stores/tasks'

interface Props {
  effort: Task['effort']
}

const props = defineProps<Props>()

const effortLabels = {
  low: 'Pouco',
  medium: 'Médio',
  high: 'Muito'
}

const effortClasses = computed(() => {
  const classes = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    high: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  }
  return classes[props.effort]
})
</script>