<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-slide-up">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Tarefas de Hoje 📋
            </h2>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bom dia! Você tem {{ todayTasks.length }} tarefa(s) para hoje:
          </p>

          <div class="space-y-3 max-h-60 overflow-y-auto">
            <div
              v-for="task in todayTasks"
              :key="task.id"
              class="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ task.title }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <PriorityBadge :priority="task.priority" />
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTime(task.dueDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Entendi
            </button>
            <router-link
              to="/tasks"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Ver Todas
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { X } from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import PriorityBadge from './PriorityBadge.vue'

defineEmits<{
  close: []
}>()

const tasksStore = useTasksStore()

const todayTasks = computed(() => tasksStore.todayTasks)

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm')
}
</script>