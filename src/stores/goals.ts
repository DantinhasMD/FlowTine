import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Goal {
  id: string
  title: string
  description: string
  category: string
  timeframe: 'short' | 'medium' | 'long'
  targetDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  progress: number // 0-100
  milestones: Milestone[]
  createdAt: string
  completedAt?: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  completedAt?: string
}

export interface GoalCategory {
  id: string
  name: string
  color: string
  icon: string
}

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const categories = ref<GoalCategory[]>([
    { id: 'health', name: 'Saúde', color: '#10B981', icon: '💪' },
    { id: 'career', name: 'Carreira', color: '#3B82F6', icon: '💼' },
    { id: 'education', name: 'Educação', color: '#8B5CF6', icon: '📚' },
    { id: 'finance', name: 'Financeiro', color: '#F59E0B', icon: '💰' },
    { id: 'relationships', name: 'Relacionamentos', color: '#EC4899', icon: '❤️' },
    { id: 'personal', name: 'Desenvolvimento Pessoal', color: '#6366F1', icon: '🌱' },
    { id: 'hobbies', name: 'Hobbies', color: '#14B8A6', icon: '🎨' },
    { id: 'travel', name: 'Viagens', color: '#F97316', icon: '✈️' }
  ])

  // Computed
  const goalsByTimeframe = computed(() => {
    return {
      short: goals.value.filter(goal => goal.timeframe === 'short'),
      medium: goals.value.filter(goal => goal.timeframe === 'medium'),
      long: goals.value.filter(goal => goal.timeframe === 'long')
    }
  })

  const goalsByCategory = computed(() => {
    const grouped: Record<string, Goal[]> = {}
    goals.value.forEach(goal => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = []
      }
      grouped[goal.category].push(goal)
    })
    return grouped
  })

  const completedGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'completed')
  })

  const activeGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'in_progress')
  })

  const overallProgress = computed(() => {
    if (goals.value.length === 0) return 0
    const totalProgress = goals.value.reduce((sum, goal) => sum + goal.progress, 0)
    return Math.round(totalProgress / goals.value.length)
  })

  // Actions
  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'milestones'>) => {
    const goal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      milestones: []
    }
    
    goals.value.push(goal)
    saveGoals()
  }

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const index = goals.value.findIndex(goal => goal.id === id)
    if (index !== -1) {
      if (updates.status === 'completed' && goals.value[index].status !== 'completed') {
        updates.completedAt = new Date().toISOString()
        updates.progress = 100
      }
      goals.value[index] = { ...goals.value[index], ...updates }
      saveGoals()
    }
  }

  const deleteGoal = (id: string) => {
    const index = goals.value.findIndex(goal => goal.id === id)
    if (index !== -1) {
      goals.value.splice(index, 1)
      saveGoals()
    }
  }

  const addMilestone = (goalId: string, milestoneData: Omit<Milestone, 'id'>) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      const milestone: Milestone = {
        ...milestoneData,
        id: Date.now().toString()
      }
      goal.milestones.push(milestone)
      updateGoalProgress(goalId)
      saveGoals()
    }
  }

  const updateMilestone = (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      const milestoneIndex = goal.milestones.findIndex(m => m.id === milestoneId)
      if (milestoneIndex !== -1) {
        if (updates.completed && !goal.milestones[milestoneIndex].completed) {
          updates.completedAt = new Date().toISOString()
        }
        goal.milestones[milestoneIndex] = { ...goal.milestones[milestoneIndex], ...updates }
        updateGoalProgress(goalId)
        saveGoals()
      }
    }
  }

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      const milestoneIndex = goal.milestones.findIndex(m => m.id === milestoneId)
      if (milestoneIndex !== -1) {
        goal.milestones.splice(milestoneIndex, 1)
        updateGoalProgress(goalId)
        saveGoals()
      }
    }
  }

  const updateGoalProgress = (goalId: string) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(m => m.completed).length
      const progress = Math.round((completedMilestones / goal.milestones.length) * 100)
      goal.progress = progress
      
      if (progress === 100 && goal.status !== 'completed') {
        goal.status = 'completed'
        goal.completedAt = new Date().toISOString()
      }
    }
  }

  const addCategory = (categoryData: Omit<GoalCategory, 'id'>) => {
    const category: GoalCategory = {
      ...categoryData,
      id: Date.now().toString()
    }
    
    categories.value.push(category)
    saveCategories()
  }

  const getCategoryById = (id: string) => {
    return categories.value.find(category => category.id === id)
  }

  const saveGoals = () => {
    localStorage.setItem('goals', JSON.stringify(goals.value))
  }

  const saveCategories = () => {
    localStorage.setItem('goalCategories', JSON.stringify(categories.value))
  }

  const loadGoals = () => {
    const savedGoals = localStorage.getItem('goals')
    const savedCategories = localStorage.getItem('goalCategories')
    
    if (savedGoals) {
      goals.value = JSON.parse(savedGoals)
    }
    
    if (savedCategories) {
      categories.value = JSON.parse(savedCategories)
    }
  }

  return {
    goals,
    categories,
    goalsByTimeframe,
    goalsByCategory,
    completedGoals,
    activeGoals,
    overallProgress,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addCategory,
    getCategoryById,
    loadGoals
  }
})