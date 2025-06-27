<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 animate-fade-in"
    :class="priorityClasses"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
          {{ task.title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {{ task.description }}
        </p>
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar class="w-3 h-3" />
          <span>{{ formatDate(task.dueDate) }}</span>
          <Clock class="w-3 h-3 ml-2" />
          <span>{{ formatTime(task.dueDate) }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <PriorityBadge :priority="task.priority" />
        <button
          @click="$emit('delete', task.id)"
          class="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$emit('edit', task)"
          class="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Pencil class="w-4 h-4" />
        </button>
      </div>

    </div>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <GroupBadge :group-id="task.groupId" />
        <TypeBadge :type="task.type" />
        <span 
          :class="effortClasses()" 
          class="px-2 py-1 text-xs font-medium rounded-md"
          title="Nível de esforço"
        >
          {{ effortLabel() }}
        </span>
      </div>
      
      <div class="flex items-center gap-1">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="$emit('updateStatus', task.id, status.value)"
          :class="{
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': task.status === status.value,
            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': task.status !== status.value
          }"
          class="px-2 py-1 text-xs font-medium rounded-md transition-colors"
        >
          {{ status.label }}
        </button>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, Trash2, Pencil} from 'lucide-vue-next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '../stores/tasks'
import PriorityBadge from './PriorityBadge.vue'
import GroupBadge from './GroupBadge.vue'
import TypeBadge from './TypeBadge.vue'

const props = defineProps<{ task: Task }>()
const task = props.task

defineEmits<{
  updateStatus: [id: string, status: Task['status']]
  delete: [id: string]
  edit: [task: Task]
}>()

const statusOptions = [
  { value: 'todo' as const, label: 'A Fazer' },
  { value: 'doing' as const, label: 'Fazendo' },
  { value: 'done' as const, label: 'Feito' }
]

const priorityClasses = computed(() => ({
  'border-l-4 border-l-red-500': false, 
}))

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
}

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm', { locale: ptBR })
}


function effortLabel() {
  switch (task.effort) {
    case 'low': return 'Pouco esforço'
    case 'medium': return 'Esforço médio'
    case 'high': return 'Muito esforço'
    default: return ''
  }
}

function effortClasses() {
  switch (task.effort) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>