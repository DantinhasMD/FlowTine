<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Estatísticas</h1>

    <!-- Monthly Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <CheckSquare class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total do Mês</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Concluídas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyStats.completed }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Clock class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendentes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <TrendingUp class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Conclusão</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyStats.completionRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Tasks by Status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status das Tarefas</h3>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="statusChartRef"></canvas>
        </div>
      </div>

      <!-- Tasks by Group -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tarefas por Grupo</h3>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="groupChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Priority Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Prioridade</h3>
      
      <div class="space-y-4">
        <div v-for="priority in priorities" :key="priority.key" class="flex items-center">
          <div class="flex-1">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ priority.label }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ priority.count }} ({{ priority.percentage }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                :class="priority.colorClass"
                class="h-2 rounded-full transition-all duration-300"
                :style="{ width: `${priority.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividade Recente</h3>
      
      <div v-if="recentCompletedTasks.length === 0" class="text-center py-8">
        <Activity class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Nenhuma tarefa concluída recentemente</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="task in recentCompletedTasks"
          :key="task.id"
          class="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
        >
          <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ task.title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Concluída em {{ formatDate(task.completedAt!) }}
            </p>
          </div>
          <PriorityBadge :priority="task.priority" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import PriorityBadge from '../components/PriorityBadge.vue'

const tasksStore = useTasksStore()

const statusChartRef = ref<HTMLCanvasElement>()
const groupChartRef = ref<HTMLCanvasElement>()

const monthlyStats = computed(() => tasksStore.monthlyStats)
const tasks = computed(() => tasksStore.tasks)

const priorities = computed(() => {
  const totalTasks = tasks.value.length
  const priorityCounts = {
    high: tasks.value.filter(t => t.priority === 'high').length,
    medium: tasks.value.filter(t => t.priority === 'medium').length,
    low: tasks.value.filter(t => t.priority === 'low').length
  }

  return [
    {
      key: 'high',
      label: 'Alta Prioridade',
      count: priorityCounts.high,
      percentage: totalTasks ? Math.round((priorityCounts.high / totalTasks) * 100) : 0,
      colorClass: 'bg-red-500'
    },
    {
      key: 'medium',
      label: 'Média Prioridade',
      count: priorityCounts.medium,
      percentage: totalTasks ? Math.round((priorityCounts.medium / totalTasks) * 100) : 0,
      colorClass: 'bg-yellow-500'
    },
    {
      key: 'low',
      label: 'Baixa Prioridade',
      count: priorityCounts.low,
      percentage: totalTasks ? Math.round((priorityCounts.low / totalTasks) * 100) : 0,
      colorClass: 'bg-green-500'
    }
  ]
})

const recentCompletedTasks = computed(() => {
  return tasks.value
    .filter(task => task.status === 'done' && task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)
})

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

onMounted(() => {
  // Aqui implementaríamos os gráficos com Chart.js
  // Por simplicidade, deixando apenas as referências
})
</script>