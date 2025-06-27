import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, addHours, parseISO, isWithinInterval } from 'date-fns'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  type: 'appointment' | 'reminder' | 'task'
  color: string
  location?: string
  reminderMinutes?: number
  createdAt: string
}

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const currentDate = ref(new Date())
  const viewMode = ref<'hour' | 'day' | 'week' | 'month' | 'semester' | 'year'>('month')

  // Computed
  const currentPeriodEvents = computed(() => {
    const now = currentDate.value
    let start: Date
    let end: Date

    switch (viewMode.value) {
      case 'hour':
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 0 })
        end = endOfWeek(now, { weekStartsOn: 0 })
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'semester':
        const currentMonth = now.getMonth()
        if (currentMonth < 6) {
          start = new Date(now.getFullYear(), 0, 1)
          end = new Date(now.getFullYear(), 5, 30, 23, 59, 59)
        } else {
          start = new Date(now.getFullYear(), 6, 1)
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
    }

    return events.value.filter(event => {
      const eventStart = parseISO(event.startDate)
      return isWithinInterval(eventStart, { start, end })
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  })

  const todayEvents = computed(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    return events.value.filter(event => {
      const eventStart = parseISO(event.startDate)
      return isWithinInterval(eventStart, { start: startOfDay, end: endOfDay })
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  })

  const upcomingReminders = computed(() => {
    const now = new Date()
    const next24Hours = addHours(now, 24)

    return events.value.filter(event => {
      if (!event.reminderMinutes) return false
      
      const eventStart = parseISO(event.startDate)
      const reminderTime = new Date(eventStart.getTime() - (event.reminderMinutes * 60 * 1000))
      
      return isWithinInterval(reminderTime, { start: now, end: next24Hours })
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  })

  // Actions
  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const event: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    events.value.push(event)
    saveEvents()
  }

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const index = events.value.findIndex(event => event.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updates }
      saveEvents()
    }
  }

  const deleteEvent = (id: string) => {
    const index = events.value.findIndex(event => event.id === id)
    if (index !== -1) {
      events.value.splice(index, 1)
      saveEvents()
    }
  }

  const setCurrentDate = (date: Date) => {
    currentDate.value = date
  }

  const setViewMode = (mode: typeof viewMode.value) => {
    viewMode.value = mode
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = currentDate.value
    let newDate: Date

    switch (viewMode.value) {
      case 'hour':
      case 'day':
        newDate = addDays(current, direction === 'next' ? 1 : -1)
        break
      case 'week':
        newDate = addDays(current, direction === 'next' ? 7 : -7)
        break
      case 'month':
        newDate = new Date(current.getFullYear(), current.getMonth() + (direction === 'next' ? 1 : -1), 1)
        break
      case 'semester':
        newDate = new Date(current.getFullYear(), current.getMonth() + (direction === 'next' ? 6 : -6), 1)
        break
      case 'year':
        newDate = new Date(current.getFullYear() + (direction === 'next' ? 1 : -1), 0, 1)
        break
      default:
        newDate = current
    }

    currentDate.value = newDate
  }

  const saveEvents = () => {
    localStorage.setItem('calendarEvents', JSON.stringify(events.value))
  }

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('calendarEvents')
    if (savedEvents) {
      events.value = JSON.parse(savedEvents)
    }
  }

  const checkReminders = () => {
    const now = new Date()
    
    events.value.forEach(event => {
      if (!event.reminderMinutes) return
      
      const eventStart = parseISO(event.startDate)
      const reminderTime = new Date(eventStart.getTime() - (event.reminderMinutes * 60 * 1000))
      
      // Verificar se é hora do lembrete (com margem de 1 minuto)
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime())
      if (timeDiff <= 60000) { // 1 minuto em millisegundos
        showReminder(event)
      }
    })
  }

  const showReminder = (event: CalendarEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Lembrete: ${event.title}`, {
        body: `${event.description}\nInício: ${format(parseISO(event.startDate), 'dd/MM/yyyy HH:mm')}`,
        icon: '/favicon.ico'
      })
    } else {
      alert(`Lembrete: ${event.title}\n${event.description}\nInício: ${format(parseISO(event.startDate), 'dd/MM/yyyy HH:mm')}`)
    }
  }

  return {
    events,
    currentDate,
    viewMode,
    currentPeriodEvents,
    todayEvents,
    upcomingReminders,
    addEvent,
    updateEvent,
    deleteEvent,
    setCurrentDate,
    setViewMode,
    navigateDate,
    loadEvents,
    checkReminders
  }
})