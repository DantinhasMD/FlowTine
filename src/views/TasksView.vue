<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tarefas</h1>
      <button
        @click="showForm = !showForm"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus class="w-4 h-4 mr-2" />
        Nova Tarefa
      </button>
    </div>

    <!-- Task Form -->
    <div v-if="showForm" class="animate-slide-up">
      <TaskForm
        :editing-task="editingTask"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            v-model="filters.status"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos</option>
            <option value="todo">A Fazer</option>
            <option value="doing">Fazendo</option>
            <option value="done">Feito</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridade
          </label>
          <select
            v-model="filters.priority"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Grupo
          </label>
          <select
            v-model="filters.group"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos</option>
            <option
              v-for="group in tasksStore.taskGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </option>
          </select>
        </div>

        <div class="flex-1"></div>

        <button
          @click="resetFilters"
          class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="space-y-4">
      <div v-if="filteredTasks.length === 0" class="text-center py-12">
        <CheckSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          {{ tasks.length === 0 ? 'Nenhuma tarefa criada ainda' : 'Nenhuma tarefa encontrada com os filtros aplicados' }}
        </p>
      </div>

      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @update-status="handleUpdateStatus"
        @delete="handleDeleteTask"
        @edit="handleEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Plus, CheckSquare } from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'
import type { Task } from '../stores/tasks'

const tasksStore = useTasksStore()

const showForm = ref(false)
const editingTask = ref<Task | null>(null)

const filters = reactive({
  status: '',
  priority: '',
  group: ''
})

const tasks = computed(() => tasksStore.tasks)

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (!filters.status || filters.status !== 'done') {
    filtered = filtered.filter(task => task.status !== 'done')
  }

  if (filters.status) {
    filtered = filtered.filter(task => task.status === filters.status)
  }

  if (filters.priority) {
    filtered = filtered.filter(task => task.priority === filters.priority)
  }

  if (filters.group) {
    filtered = filtered.filter(task => task.groupId === filters.group)
  }

  return filtered.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
})

const handleSubmit = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
    editingTask.value = null
  } else {
    tasksStore.addTask(taskData)
  }
  showForm.value = false
}

const handleCancel = () => {
  showForm.value = false
  editingTask.value = null
}

const handleEdit = (task: Task) => {
  editingTask.value = task
  showForm.value = true
}

const handleUpdateStatus = (id: string, status: Task['status']) => {
  tasksStore.updateTask(id, { status })
}

const handleDeleteTask = (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    tasksStore.deleteTask(id)
  }
}

const resetFilters = () => {
  filters.status = ''
  filters.priority = ''
  filters.group = ''
}
</script>
