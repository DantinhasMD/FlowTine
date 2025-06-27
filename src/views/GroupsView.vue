<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Grupos</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Criar Novo Grupo</h2>
      <GroupForm @group-created="handleGroupCreated" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in tasksStore.taskGroups"
        :key="group.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white" :style="{ color: group.color }">
            {{ group.name }}
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            {{ getTasksInGroup(group.id).length }} tarefa{{ getTasksInGroup(group.id).length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">A Fazer</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getTasksByStatus(getTasksInGroup(group.id), 'todo').length }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Fazendo</span>
            <span class="font-medium text-yellow-600 dark:text-yellow-400">
              {{ getTasksByStatus(getTasksInGroup(group.id), 'doing').length }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Concluídas</span>
            <span class="font-medium text-green-600 dark:text-green-400">
              {{ getTasksByStatus(getTasksInGroup(group.id), 'done').length }}
            </span>
          </div>
        </div>

        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getCompletionPercentage(getTasksInGroup(group.id))}%`, backgroundColor: group.color }"
          ></div>
        </div>

        <div class="flex gap-2">
          <button
            @click="viewGroup(group.id)"
            class="flex-1 text-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Ver Tarefas
          </button>
          <button
            v-if="!isDefaultGroup(group.id)"
            @click="deleteGroup(group.id)"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
            title="Excluir Grupo"
          >
            <X class="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div
        v-if="unassignedTasks.length > 0 || selectedGroup === 'unassigned'"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Sem Grupo
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
            {{ unassignedTasks.length }} tarefa{{ unassignedTasks.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">A Fazer</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ tasksStore.getTasksByStatus(unassignedTasks, 'todo').length }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Fazendo</span>
            <span class="font-medium text-yellow-600 dark:text-yellow-400">
              {{ tasksStore.getTasksByStatus(unassignedTasks, 'doing').length }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Concluídas</span>
            <span class="font-medium text-green-600 dark:text-green-400">
              {{ tasksStore.getTasksByStatus(unassignedTasks, 'done').length }}
            </span>
          </div>
        </div>

        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getCompletionPercentage(unassignedTasks)}%` }"
          ></div>
        </div>

        <button
          @click="viewGroup('unassigned')"
          class="w-full text-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Ver Tarefas
        </button>
      </div>
    </div>

    <div v-if="selectedGroup" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Tarefas do Grupo: {{ tasksStore.getGroupById(selectedGroup)?.name || 'Carregando...' }}
          </h2>
          <button
            @click="selectedGroup = null"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="p-6">
        <div v-if="selectedGroupTasks.length === 0" class="text-center py-8">
          <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">
            Nenhuma tarefa neste grupo ainda
          </p>
        </div>

        <div v-else class="space-y-4">
          <TaskCard
            v-for="task in selectedGroupTasks"
            :key="task.id"
            :task="task"
            @update-status="handleUpdateStatus"
            @delete="handleDeleteTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' 
import { Users, X } from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import GroupForm from '../components/GroupForm.vue'
import type { Task, TaskGroup } from '../stores/tasks'

const tasksStore = useTasksStore()

const selectedGroup = ref<string | null>(null)

onMounted(() => {
  tasksStore.loadTasks();
});

const unassignedTasks = computed(() => {
  return tasksStore.tasks.filter(task => !task.groupId);
});

const selectedGroupTasks = computed(() => {
  if (!selectedGroup.value) return [];

  let tasksToDisplay: Task[] = [];
  if (selectedGroup.value === 'unassigned') {
    tasksToDisplay = unassignedTasks.value;
  } else {
    tasksToDisplay = tasksStore.getTasksByGroup(selectedGroup.value);
  }

  const undoneTasks = tasksToDisplay.filter(task => task.status !== 'done');
  const doneTasks = tasksToDisplay.filter(task => task.status === 'done');

  undoneTasks.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  doneTasks.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA; 
  });

  return [...undoneTasks, ...doneTasks];
});

const getTasksInGroup = (groupId: string) => {
  return tasksStore.getTasksByGroup(groupId);
}

const getTasksByStatus = (tasksArray: Task[], status: Task['status']) => {
  return tasksStore.getTasksByStatus(tasksArray, status); 
}

const getCompletionPercentage = (tasks: Task[]) => {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(task => task.status === 'done').length
  return Math.round((completed / tasks.length) * 100)
}

const viewGroup = (groupId: string) => {
  selectedGroup.value = groupId
}

const handleUpdateStatus = (id: string, status: Task['status']) => {
  tasksStore.updateTask(id, { status })
}

const handleDeleteTask = (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    tasksStore.deleteTask(id)
  }
}

const handleGroupCreated = () => {
  console.log('Novo grupo criado!');
}

const isDefaultGroup = (groupId: string) => {
  const defaultGroupsIds = ['personal', 'professional', 'study', 'leisure', 'domestic'];
  return defaultGroupsIds.includes(groupId);
}

const deleteGroup = (groupId: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo? As tarefas associadas a ele ficarão sem grupo.')) {
        tasksStore.deleteTaskGroup(groupId);
        if (selectedGroup.value === groupId) {
            selectedGroup.value = null; 
        }
    }
}
</script>