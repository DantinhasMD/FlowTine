<template>
  <aside 
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        Your FlowTine 
      </h1>
      <button
        @click="$emit('toggle')"
        class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <nav class="mt-6 px-3">
      <div class="space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="{
            'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300': $route.name === item.name,
            'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800': $route.name !== item.name
          }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.label }}
        </router-link>
      </div>
    </nav>
  </aside>

  <!-- Overlay para mobile -->
  <div
    v-if="isOpen"
    @click="$emit('toggle')"
    class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
  ></div>
</template>

<script setup lang="ts">
import {
  Home,
  Calendar,
  Goal,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  MessageCircle,
  X
} from 'lucide-vue-next'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
defineEmits<{
  toggle: []
}>()

const menuItems = [
  {
    name: 'Dashboard',
    label: 'Hoje',
    to: '/',
    icon: Home
  },
   {
    name: 'Calendar',
    label: 'Calendário',
    to: '/calendar',
    icon: Calendar
  },
   {
    name: 'Goals',
    label: 'Metas',
    to: '/goals',
    icon: Goal
  },
  {
    name: 'Tasks',
    label: 'Tarefas',
    to: '/tasks',
    icon: CheckSquare
  },
  {
    name: 'Groups',
    label: 'Grupos',
    to: '/groups',
    icon: Users
  },
  {
    name: 'Statistics',
    label: 'Estatísticas',
    to: '/statistics',
    icon: BarChart3
  },
  {
    name: 'Chat',
    label: 'Assistente',
    to: '/chat',
    icon: MessageCircle
  },
  {
    name: 'Settings',
    label: 'Configurações',
    to: '/settings',
    icon: Settings
  }
]
</script>