<template>
  <div class="goals-view p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Minhas Metas 🎯</h1>

    <div class="flex justify-end mb-6">
      <button
        @click="openGoalModal()"
        class="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
      >
        + Nova Meta
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label for="filterStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Status</label>
        <select id="filterStatus" v-model="filterStatus"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white">
          <option value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="in-progress">Em Progresso</option>
          <option value="completed">Concluída</option>
          <option value="archived">Arquivada</option>
        </select>
      </div>
      <div>
        <label for="filterPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Prioridade</label>
        <select id="filterPriority" v-model="filterPriority"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white">
          <option value="all">Todas</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>
      <div>
        <label for="sortOrder" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
        <select id="sortOrder" v-model="sortOrder"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white">
          <option value="targetDateAsc">Data Alvo (Crescente)</option>
          <option value="targetDateDesc">Data Alvo (Decrescente)</option>
          <option value="priorityDesc">Prioridade (Maior para Menor)</option>
          <option value="createdAtDesc">Mais Recente</option>
        </select>
      </div>
    </div>

    <div v-if="filteredGoals.length > 0" class="space-y-4">
      <div v-for="goal in filteredGoals" :key="goal.id"
           :class="['goal-card p-4 rounded-lg shadow-sm border', getGoalCardClasses(goal.status, goal.priority)]">
        <div class="flex items-center justify-between mb-2">
          <h3 :class="['text-lg font-semibold', getGoalTitleClasses(goal.status)]">{{ goal.title }}</h3>
          <div class="flex items-center space-x-2">
            <span :class="['text-xs px-2 py-1 rounded-full', getPriorityClasses(goal.priority)]">{{ getPriorityLabel(goal.priority) }}</span>
            <span :class="['text-xs px-2 py-1 rounded-full', getStatusClasses(goal.status)]">{{ getStatusLabel(goal.status) }}</span>
          </div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-2">{{ goal.description }}</p>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <p><strong>Data Alvo:</strong> {{ format(parseISO(goal.targetDate), 'dd/MM/yyyy') }}</p>
          <p v-if="goal.status === 'completed' && goal.completedAt"><strong>Concluída em:</strong> {{ format(parseISO(goal.completedAt), 'dd/MM/yyyy') }}</p>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="openGoalModal(goal)"
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Editar
          </button>
          <button
            @click="toggleGoalStatus(goal)"
            :class="['px-3 py-1 text-sm rounded-md transition-colors', getToggleStatusButtonClasses(goal.status)]"
          >
            {{ goal.status === 'completed' ? 'Marcar como Pendente' : 'Marcar como Concluída' }}
          </button>
          <button
            @click="deleteGoal(goal.id)"
            class="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-600 dark:text-gray-400">
      <p class="text-lg">Nenhuma meta encontrada. Comece adicionando uma nova!</p>
      <button
        @click="openGoalModal()"
        class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
      >
        Adicionar Primeira Meta
      </button>
    </div>

    <Transition name="fade">
      <div v-if="isGoalModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeGoalModal()">
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative">
          <button @click="closeGoalModal()" class="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ editingGoal ? 'Editar Meta' : 'Nova Meta' }}
          </h2>
          <form @submit.prevent="saveGoal" class="space-y-4">
            <div>
              <label for="goalTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Meta *</label>
              <input type="text" id="goalTitle" v-model="goalForm.title" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white">
            </div>
            <div>
              <label for="goalDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <textarea id="goalDescription" v-model="goalForm.description" rows="3"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"></textarea>
            </div>
            <div>
              <label for="goalTargetDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Alvo *</label>
              <input type="date" id="goalTargetDate" v-model="goalForm.targetDate" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white">
            </div>
            <div>
              <label for="goalPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioridade</label>
              <select id="goalPriority" v-model="goalForm.priority"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div v-if="editingGoal">
              <label for="goalStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select id="goalStatus" v-model="goalForm.status"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white">
                <option value="pending">Pendente</option>
                <option value="in-progress">Em Progresso</option>
                <option value="completed">Concluída</option>
                <option value="archived">Arquivada</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeGoalModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {{ editingGoal ? 'Atualizar Meta' : 'Criar Meta' }}
              </button>
              <button
                v-if="editingGoal"
                type="button"
                @click="deleteGoal(editingGoal.id)"
                class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md shadow-sm hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
              >
                Excluir
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useGoalsStore, type Goal } from '../stores/goals';
import { format, parseISO } from 'date-fns';

const goalsStore = useGoalsStore();

const isGoalModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);

const filterStatus = ref<'all' | 'pending' | 'in-progress' | 'completed' | 'archived'>('all');
const filterPriority = ref<'all' | 'low' | 'medium' | 'high'>('all');
const sortOrder = ref<'targetDateAsc' | 'targetDateDesc' | 'priorityDesc' | 'createdAtDesc'>('targetDateAsc');

const goalForm = reactive({
  id: '',
  title: '',
  description: '',
  targetDate: '', 
  status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'archived',
  priority: 'medium' as 'low' | 'medium' | 'high',
});

const filteredGoals = computed(() => {
  let filtered = goalsStore.goals;

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(goal => goal.status === filterStatus.value);
  }

  if (filterPriority.value !== 'all') {
    filtered = filtered.filter(goal => goal.priority === filterPriority.value);
  }

  filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'targetDateAsc':
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      case 'targetDateDesc':
        return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
      case 'priorityDesc':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'createdAtDesc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return filtered;
});

const openGoalModal = (goal: Goal | null = null) => {
  editingGoal.value = goal;
  if (goal) {
    Object.assign(goalForm, {
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate, 
      status: goal.status,
      priority: goal.priority,
    });
  } else {
    Object.assign(goalForm, {
      id: '',
      title: '',
      description: '',
      targetDate: '', 
      status: 'pending', 
      priority: 'medium', 
    });
    const today = new Date();
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    goalForm.targetDate = format(oneMonthFromNow, 'yyyy-MM-dd');
  }
  isGoalModalOpen.value = true;
};

const closeGoalModal = () => {
  isGoalModalOpen.value = false;
  editingGoal.value = null;
  Object.assign(goalForm, {
    id: '',
    title: '',
    description: '',
    targetDate: '',
    status: 'pending',
    priority: 'medium',
  });
};

const saveGoal = () => {
  if (!goalForm.title || !goalForm.targetDate) {
    alert('Título e Data Alvo são obrigatórios!');
    return;
  }

  const goalData = {
    title: goalForm.title,
    description: goalForm.description,
    targetDate: goalForm.targetDate,
    priority: goalForm.priority,
    status: goalForm.status, 
  };

  if (editingGoal.value?.id) {
    goalsStore.updateGoal(editingGoal.value.id, goalData);
    alert('Meta atualizada com sucesso!');
  } else {
    goalsStore.addGoal({ ...goalData, status: 'pending' }); 
    alert('Meta criada com sucesso!');
  }
  closeGoalModal();
};

const deleteGoal = (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta meta?')) {
    goalsStore.deleteGoal(id);
    alert('Meta excluída!');
    closeGoalModal();
  }
};

const toggleGoalStatus = (goal: Goal) => {
  const newStatus = goal.status === 'completed' ? 'pending' : 'completed';
  goalsStore.updateGoal(goal.id, { status: newStatus });
};

const getStatusLabel = (status: Goal['status']) => {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'in-progress': return 'Em Progresso';
    case 'completed': return 'Concluída';
    case 'archived': return 'Arquivada';
    default: return '';
  }
};

const getPriorityLabel = (priority: Goal['priority']) => {
  switch (priority) {
    case 'low': return 'Baixa';
    case 'medium': return 'Média';
    case 'high': return 'Alta';
    default: return '';
  }
};

const getGoalCardClasses = (status: Goal['status'], priority: Goal['priority']) => {
  const classes: string[] = [];
  switch (status) {
    case 'completed': classes.push('border-green-400 dark:border-green-600'); break;
    case 'in-progress': classes.push('border-blue-400 dark:border-blue-600'); break;
    case 'pending': classes.push('border-yellow-400 dark:border-yellow-600'); break;
    case 'archived': classes.push('border-gray-400 dark:border-gray-600'); break;
    default: classes.push('border-gray-300 dark:border-gray-600'); break;
  }

  return classes;
};

const getGoalTitleClasses = (status: Goal['status']) => {
  return status === 'completed' ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white';
};

const getPriorityClasses = (priority: Goal['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getStatusClasses = (status: Goal['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getToggleStatusButtonClasses = (status: Goal['status']) => {
  return status === 'completed'
    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
    : 'bg-green-500 text-white hover:bg-green-600';
};

onMounted(() => {
  goalsStore.loadGoals();
});
</script>

<style scoped>

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.goal-card {
  transition: all 0.2s ease-in-out;
}

.dark .goal-card {
  background-color: #1F2937; 
}
</style>