<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex h-screen">
      <!-- Sidebar -->
      <Sidebar :is-open="sidebarOpen" @toggle="toggleSidebar" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <!-- Top Header -->
        <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div class="px-4 py-3 flex items-center justify-between">
            <button
              @click="toggleSidebar"
              class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            >
              <Menu class="w-6 h-6" />
            </button>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ getPageTitle() }}
            </h1>
            <div class="w-10"></div> <!-- Spacer for center alignment -->
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto">
          <div class="p-6">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- Daily Tasks Modal -->
    <DailyTasksModal v-if="showDailyModal" @close="closeDailyModal" />

    <!-- Reminder Notifications -->
    <div v-if="upcomingReminders.length > 0" class="fixed top-4 right-4 z-50">
      <div
        v-for="reminder in upcomingReminders.slice(0, 3)"
        :key="reminder.id"
        class="bg-blue-500 text-white p-4 rounded-lg shadow-lg mb-2 max-w-sm animate-slide-up"
      >
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-semibold">{{ reminder.title }}</h4>
            <p class="text-sm opacity-90">{{ reminder.description }}</p>
            <p class="text-xs opacity-75 mt-1">
              {{ formatTime(reminder.startDate) }}
            </p>
          </div>
          <button
            @click="dismissReminder(reminder.id)"
            class="text-white hover:text-gray-200"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { Menu, X } from 'lucide-vue-next'
import { useAuthStore } from './stores/auth'
import { useTasksStore } from './stores/tasks'
import { useChatbotStore } from './stores/chatbot'
import { useCalendarStore } from './stores/calendar'
import { useGoalsStore } from './stores/goals'
import Sidebar from './components/Sidebar.vue'
import DailyTasksModal from './components/DailyTasksModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const chatbotStore = useChatbotStore()
const calendarStore = useCalendarStore()
const goalsStore = useGoalsStore()

const sidebarOpen = ref(false)
const showDailyModal = ref(false)

const upcomingReminders = computed(() => calendarStore.upcomingReminders)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const getPageTitle = () => {
  const titles: Record<string, string> = {
    'Dashboard': 'Hoje',
    'Tasks': 'Tarefas',
    'Calendar': 'Calendário',
    'Goals': 'Metas',
    'Groups': 'Grupos',
    'Statistics': 'Estatísticas',
    'Chat': 'Assistente',
    'Settings': 'Configurações'
  }
  return titles[route.name as string] || 'Organizador'
}

const closeDailyModal = () => {
  showDailyModal.value = false
  localStorage.setItem('lastDailyModal', new Date().toDateString())
}

const dismissReminder = (id: string) => {
console.log('Lembrete a ser descartado:', id);
  // TODO: Implementar lógica para dispensar lembrete
}

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm')
}

onMounted(() => {
  // Initialize stores
  authStore.initializeFromStorage()
  tasksStore.loadTasks()
  chatbotStore.loadMessages()
  calendarStore.loadEvents()
  goalsStore.loadGoals()
  
  // Apply theme
  const theme = authStore.user.preferences.theme || 'light'
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Show daily modal if haven't shown today
  const lastModal = localStorage.getItem('lastDailyModal')
  const today = new Date().toDateString()
  if (lastModal !== today && tasksStore.todayTasks.length > 0) {
    setTimeout(() => {
      showDailyModal.value = true
    }, 1000)
  }

  // Check for reminders every minute
  setInterval(() => {
    calendarStore.checkReminders()
  }, 60000)
})
</script>