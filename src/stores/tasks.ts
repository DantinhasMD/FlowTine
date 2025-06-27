import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { startOfMonth, endOfMonth, isToday, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid' 

export interface TaskGroup {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  type: 'routine' | 'pending'
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  groupId?: string 
  status: 'todo' | 'doing' | 'done'
  createdAt: string
  completedAt?: string
  updatedAt?: string 
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const taskGroups = ref<TaskGroup[]>([
    { id: 'personal', name: 'Pessoal', color: '#8B5CF6', createdAt: new Date().toISOString() },
    { id: 'professional', name: 'Profissional', color: '#3B82F6', createdAt: new Date().toISOString() },
    { id: 'study', name: 'Estudo', color: '#6366F1', createdAt: new Date().toISOString() },
    { id: 'leisure', name: 'Lazer', color: '#EC4899', createdAt: new Date().toISOString() },
    { id: 'domestic', name: 'Doméstico', color: '#14B8A6', createdAt: new Date().toISOString() }
  ])

  // Computed
  const todayTasks = computed(() => {
    return tasks.value
      .filter(task => isToday(parseISO(task.dueDate)) && task.status !== 'done')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
  })

  const tasksByGroup = computed(() => {
    const grouped: Record<string, Task[]> = {};

    taskGroups.value.forEach(group => {
      grouped[group.id] = [];
    });
    grouped['unassigned'] = [];

    tasks.value.forEach(task => {
      if (task.groupId && grouped[task.groupId]) {
        grouped[task.groupId].push(task);
      } else {
        grouped['unassigned'].push(task);
      }
    });
    return grouped;
  });

  const monthlyStats = computed(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const monthTasks = tasks.value.filter(task => {
      const taskDate = parseISO(task.createdAt)
      return taskDate >= monthStart && taskDate <= monthEnd
    })

    const completed = monthTasks.filter(task => task.status === 'done').length
    const total = monthTasks.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      completed,
      total,
      completionRate,
      pending: total - completed
    }
  })

  const urgentTasks = computed(() => {
    return tasks.value.filter(task =>
      task.priority === 'high' &&
      task.status !== 'done' &&
      isToday(parseISO(task.dueDate))
    )
  })

  // Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedAt' | 'updatedAt'> & { status?: 'todo' | 'doing' | 'done' }) => {
    const task: Task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: taskData.status || 'todo',
      ...taskData,
    }
    tasks.value.push(task)
    saveTasks()
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      if (updates.status === 'done' && tasks.value[index].status !== 'done') {
        updates.completedAt = new Date().toISOString()
      }
      updates.updatedAt = new Date().toISOString();
      tasks.value[index] = { ...tasks.value[index], ...updates }
      saveTasks()
    }
  }

  const deleteTask = (id: string) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      saveTasks()
    }
  }

  const getTasksByStatus = (tasksArray: Task[], status: Task['status']) => { 
    return tasksArray.filter(task => task.status === status)
  }

  const getTasksByGroup = (groupId: string) => {
    return tasks.value.filter(task => {
      if (groupId === 'unassigned') {
        return !task.groupId;
      }
      return task.groupId === groupId;
    });
  }

  const getGroupById = (id: string) => {
    if (id === 'unassigned') {
      return { id: 'unassigned', name: 'Sem Grupo', color: '#9CA3AF', createdAt: new Date().toISOString() };
    }
    return taskGroups.value.find(group => group.id === id)
  }

  const addTaskGroup = (groupData: Omit<TaskGroup, 'id' | 'createdAt'>) => {
    const group: TaskGroup = {
      ...groupData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }
    taskGroups.value.push(group)
    saveTaskGroups()
  }

  const updateTaskGroup = (id: string, updates: Partial<TaskGroup>) => {
    const index = taskGroups.value.findIndex(group => group.id === id)
    if (index !== -1) {
      taskGroups.value[index] = { ...taskGroups.value[index], ...updates }
      saveTaskGroups()
    }
  }

  const deleteTaskGroup = (id: string) => {
    const defaultGroupsIds = ['personal', 'professional', 'study', 'leisure', 'domestic'];
    if (defaultGroupsIds.includes(id)) {
      alert('Não é possível excluir grupos padrão.');
      return;
    }

    const index = taskGroups.value.findIndex(group => group.id === id);
    if (index !== -1) {
      tasks.value.forEach(task => {
        if (task.groupId === id) {
          task.groupId = undefined; 
          task.updatedAt = new Date().toISOString();
        }
      });
      taskGroups.value.splice(index, 1);
      saveTaskGroups();
      saveTasks();
    }
  }

  // Persistência
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  const saveTaskGroups = () => {
    localStorage.setItem('taskGroups', JSON.stringify(taskGroups.value))
  }

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('tasks')
    const savedGroups = localStorage.getItem('taskGroups')

    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks)
    }

    if (savedGroups) {
      taskGroups.value = JSON.parse(savedGroups);
    } else {
      taskGroups.value = [
        { id: 'personal', name: 'Pessoal', color: '#8B5CF6', createdAt: new Date().toISOString() },
        { id: 'professional', name: 'Profissional', color: '#3B82F6', createdAt: new Date().toISOString() },
        { id: 'study', name: 'Estudo', color: '#6366F1', createdAt: new Date().toISOString() },
        { id: 'leisure', name: 'Lazer', color: '#EC4899', createdAt: new Date().toISOString() },
        { id: 'domestic', name: 'Doméstico', color: '#14B8A6', createdAt: new Date().toISOString() }
      ];
      saveTaskGroups(); 
    }
  }

  return {
    tasks,
    taskGroups,
    todayTasks,
    tasksByGroup,
    monthlyStats,
    urgentTasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByGroup,
    getGroupById,
    addTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    loadTasks
  }
})