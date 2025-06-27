<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
      <h1 class="text-2xl font-bold mb-2">
        Olá, {{ user?.name }}! 👋
      </h1>
      <p class="opacity-90">
        Você tem {{ todayTasks.length }} tarefa(s) e {{ todayEvents.length }} compromisso(s) para hoje
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <CheckSquare class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tarefas Concluídas</p>
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
            <Target class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Metas Ativas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeGoals.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
            <TrendingUp class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Conclusão</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyStats.completionRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Daily Tasks -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Tarefas de Hoje</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR }) }}
          </p>
        </div>

        <div class="p-6">
          <div v-if="todayTasks.length === 0" class="text-center py-8">
            <CheckSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">Nenhuma tarefa para hoje! 🎉</p>
            <router-link
              to="/tasks"
              class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
            >
              <Plus class="w-4 h-4 mr-2" />
              Adicionar Tarefa
            </router-link>
          </div>

          <div v-else class="space-y-4 max-h-96 overflow-y-auto">
            <TaskCard
              v-for="task in todayTasks.slice(0, 5)"
              :key="task.id"
              :task="task"
              @update-status="handleUpdateStatus"
              @delete="handleDeleteTask"
            />
            <div v-if="todayTasks.length > 5" class="text-center pt-4">
              <router-link
                to="/tasks"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todas as {{ todayTasks.length }} tarefas →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Events -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Compromissos de Hoje</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Próximos eventos
          </p>
        </div>

        <div class="p-6">
          <div v-if="todayEvents.length === 0" class="text-center py-8">
            <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">Nenhum compromisso hoje</p>
            <router-link
              to="/calendar"
              class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
            >
              <Plus class="w-4 h-4 mr-2" />
              Adicionar Compromisso
            </router-link>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="event in todayEvents.slice(0, 5)"
              :key="event.id"
              class="p-3 rounded-lg border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :style="{ borderLeftColor: event.color }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ event.title }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ event.description }}</p>
                  <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatEventTime(event) }}</span>
                    <span v-if="event.location" class="flex items-center gap-1">
                      <MapPin class="w-3 h-3" />
                      {{ event.location }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="todayEvents.length > 5" class="text-center pt-4">
              <router-link
                to="/calendar"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todos os {{ todayEvents.length }} compromissos →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Goals -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Metas em Andamento</h2>
          <router-link
            to="/goals"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas →
          </router-link>
        </div>
      </div>

      <div class="p-6">
        <div v-if="activeGoals.length === 0" class="text-center py-8">
          <Target class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">Nenhuma meta ativa</p>
          <router-link
            to="/goals"
            class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            <Plus class="w-4 h-4 mr-2" />
            Criar Meta
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="goal in activeGoals.slice(0, 6)"
            :key="goal.id"
            class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">{{ getCategoryIcon(goal.category) }}</span>
              <h4 class="font-medium text-gray-900 dark:text-white">{{ goal.title }}</h4>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Progresso</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ goal.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${goal.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Urgent Tasks Alert -->
    <div v-if="urgentTasks.length > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex items-start">
        <AlertTriangle class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
            Tarefas Urgentes
          </h3>
          <p class="text-sm text-red-700 dark:text-red-400 mt-1">
            Você tem {{ urgentTasks.length }} tarefa(s) de alta prioridade para hoje.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Target,
  Plus, 
  AlertTriangle,
  MapPin
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useTasksStore } from '../stores/tasks'
import { useCalendarStore } from '../stores/calendar'
import { useGoalsStore } from '../stores/goals'
import TaskCard from '../components/TaskCard.vue'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const calendarStore = useCalendarStore()
const goalsStore = useGoalsStore()

const user = computed(() => authStore.user)
const todayTasks = computed(() => tasksStore.todayTasks)
const todayEvents = computed(() => calendarStore.todayEvents)
const monthlyStats = computed(() => tasksStore.monthlyStats)
const urgentTasks = computed(() => tasksStore.urgentTasks)
const activeGoals = computed(() => goalsStore.activeGoals)

const formatEventTime = (event: any) => {
  const start = format(parseISO(event.startDate), 'HH:mm')
  const end = format(parseISO(event.endDate), 'HH:mm')
  return `${start} - ${end}`
}

const getCategoryIcon = (categoryId: string) => {
  const category = goalsStore.getCategoryById(categoryId)
  return category?.icon || '🎯'
}

const handleUpdateStatus = (id: string, status: any) => {
  tasksStore.updateTask(id, { status })
}

const handleDeleteTask = (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    tasksStore.deleteTask(id)
  }
}
</script>