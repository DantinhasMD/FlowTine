<template>
  <span
    v-if="group"
    class="px-2 py-1 text-xs font-medium rounded-full"
    :style="{ backgroundColor: group.color + '33', color: group.color }"
  >
    {{ group.name }}
  </span>
  <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
    Sem grupo
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../stores/tasks'

const props = defineProps<{ groupId: string }>()
const store = useTasksStore()
const group = computed(() => store.getGroupById(props.groupId))
</script>
