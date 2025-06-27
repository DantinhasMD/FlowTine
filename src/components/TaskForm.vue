<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ editingTask ? 'Editar Tarefa' : 'Nova Tarefa' }}
    </h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título *
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Digite o título da tarefa"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Digite uma descrição (opcional)"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data e Hora *
          </label>
          <input
            v-model="form.dueDate"
            type="datetime-local"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite a data e hora"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridade
          </label>
          <select
            v-model="form.priority"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="routine">Rotineira</option>
            <option value="pending">Pendência</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Esforço Necessário
          </label>
          <select
            v-model="form.effort"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Pouco</option>
            <option value="medium">Médio</option>
            <option value="high">Muito</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Grupo *
        </label>
        <select
          v-model="form.groupId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option :value="undefined">Sem Grupo</option> 
          <option
            v-for="group in tasksStore.taskGroups"
            :key="group.id"
            :value="group.id"
          >
            {{ group.name }}
          </option>
        </select>
      </div>

      <div v-if="form.group === 'custom'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome do Grupo Personalizado
        </label>
        <input
          v-model="form.customGroup"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Digite o nome do grupo"
        />
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {{ editingTask ? 'Atualizar' : 'Criar Tarefa' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useTasksStore } from '../stores/tasks'
import type { Task } from '../stores/tasks'

interface Props {
  editingTask?: Task | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [taskData: Omit<Task, 'id' | 'createdAt'>]
  cancel: []
}>()

const tasksStore = useTasksStore()

const form = reactive({
  title: '',
  description: '',
  dueDate: '',
  type: 'routine' as Task['type'],
  priority: 'medium' as Task['priority'],
  effort: 'medium' as Task['effort'],
  groupId: undefined as string | undefined, 
  status: 'todo' as Task['status']
})

watch(() => props.editingTask, (task) => {
  if (task) {
    Object.assign(form, {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      type: task.type,
      priority: task.priority,
      effort: task.effort,
      groupId: task.groupId || undefined, 
      status: task.status
    })
  } else {
    Object.assign(form, {
      title: '',
      description: '',
      dueDate: '',
      type: 'routine',
      priority: 'medium',
      effort: 'medium',
      groupId: undefined, 
      status: 'todo'
    })
  }
}, { immediate: true })

const handleSubmit = () => {
  const taskData = {
    title: form.title,
    description: form.description,
    dueDate: form.dueDate,
    type: form.type,
    priority: form.priority,
    effort: form.effort,
    groupId: form.groupId,
    status: form.status
  }

  emit('submit', taskData)

  if (!props.editingTask) {
    Object.assign(form, {
      title: '',
      description: '',
      dueDate: '',
      type: 'routine',
      priority: 'medium',
      effort: 'medium',
      groupId: undefined, 
      status: 'todo'
    })
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>