<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Perfil</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome
          </label>
          <input
            v-model="profileForm.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          @click="updateProfile"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Salvar Perfil
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Método de Organização</h2>
      
      <div class="space-y-4">
        <div
          v-for="method in organizationMethods"
          :key="method.id"
          class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
          :class="{
            'border-primary-500 bg-primary-50 dark:bg-primary-900/20': preferences.organizationMethod === method.id,
            'hover:bg-gray-50 dark:hover:bg-gray-700': preferences.organizationMethod !== method.id
          }"
          @click="updateOrganizationMethod(method.id)"
        >
          <div class="flex items-start">
            <input
              type="radio"
              :id="method.id"
              :value="method.id"
              v-model="preferences.organizationMethod"
              class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div class="ml-3">
              <label :for="method.id" class="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {{ method.name }}
              </label>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ method.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aparência</h2>
      
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">Tema Escuro</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Alternar entre tema claro e escuro</p>
        </div>
        <button
          @click="toggleTheme"
          :class="{
            'bg-primary-600': preferences.theme === 'dark',
            'bg-gray-200': preferences.theme === 'light'
          }"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <span
            :class="{
              'translate-x-5': preferences.theme === 'dark',
              'translate-x-0': preferences.theme === 'light'
            }"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          ></span>
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificações</h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Notificações Push</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Receber notificações de tarefas importantes</p>
          </div>
          <button
            @click="toggleNotifications"
            :class="{
              'bg-primary-600': preferences.notifications,
              'bg-gray-200': !preferences.notifications
            }"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span
              :class="{
                'translate-x-5': preferences.notifications,
                'translate-x-0': !preferences.notifications
              }"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <button
          v-if="preferences.notifications"
          @click="requestNotificationPermission"
          class="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
        >
          Permitir Notificações do Navegador
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gerenciar Dados</h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Limpar Todos os Dados</h3>
            <p class="text-sm text-red-600 dark:text-red-400">Esta ação não pode ser desfeita</p>
          </div>
          <button
            @click="clearAllData"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
          >
            Limpar Dados
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatbotStore } from '../stores/chatbot'

const authStore = useAuthStore()
const chatbotStore = useChatbotStore()

const profileForm = reactive({
  name: '',
})

const preferences = computed(() => authStore.user?.preferences || { theme: 'light', organizationMethod: 'timeline', notifications: false })

onMounted(() => {
  if (authStore.user) {
    profileForm.name = authStore.user.name || '';
  }
  applyInitialTheme();
})

const organizationMethods = computed(() => Object.values(chatbotStore.organizationMethods))

const updateProfile = () => {
  if (authStore.user) {
    authStore.updateName(profileForm.name)
    alert('Perfil atualizado com sucesso!')
  } else {
    alert('Erro: Usuário não autenticado.')
  }
}

type OrganizationMethod = 'gtd' | 'timeblocking' | 'cyclical' | 'eisenhower'

const updateOrganizationMethod = (methodId: OrganizationMethod) => {
  authStore.updatePreferences({ organizationMethod: methodId })
  chatbotStore.setOrganizationMethod(methodId)
}

const toggleTheme = () => {
  const currentTheme = preferences.value.theme
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  authStore.updatePreferences({ theme: newTheme })
  
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleNotifications = () => {
  authStore.updatePreferences({ notifications: !preferences.value.notifications })
}

const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification('Organizador de Rotina', {
        body: 'Notificações ativadas com sucesso!',
        icon: '/favicon.ico'
      })
    } else {
      alert('Permissão de notificação negada.')
    }
  } else {
    alert('Seu navegador não suporta notificações.')
  }
}

const clearAllData = () => {
  if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
    localStorage.clear()
    alert('Todos os dados foram removidos. A página será recarregada.')
    window.location.reload()
  }
}

const applyInitialTheme = () => {
  if (preferences.value.theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>