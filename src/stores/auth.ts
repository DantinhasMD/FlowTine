import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  name: string
  preferences: {
    theme: 'light' | 'dark'
    organizationMethod: 'gtd' | 'timeblocking' | 'cyclical' | 'eisenhower'
    notifications: boolean
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User>({
    id: '1',
    name: 'Usuário',
    preferences: {
      theme: 'light',
      organizationMethod: 'gtd',
      notifications: true
    }
  })

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    user.value.preferences = { ...user.value.preferences, ...preferences }
    localStorage.setItem('userPreferences', JSON.stringify(user.value.preferences))
  }

  const updateName = (name: string) => {
    user.value.name = name
    localStorage.setItem('userName', name)
  }

  const initializeFromStorage = () => {
    const savedPreferences = localStorage.getItem('userPreferences')
    const savedName = localStorage.getItem('userName')
    
    if (savedPreferences) {
      user.value.preferences = JSON.parse(savedPreferences)
    }
    
    if (savedName) {
      user.value.name = savedName
    }
  }

  return {
    user,
    updatePreferences,
    updateName,
    initializeFromStorage
  }
})