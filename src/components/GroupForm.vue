<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-2 mb-4"> <div>
        <label for="groupName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Grupo</label>
        <input
          id="groupName"
          v-model="name"
          required
          type="text"
          placeholder="Ex: Finanças"
          class="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <label for="groupColor" class="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
        <input
          id="groupColor"
          v-model="color"
          type="color"
          class="w-8 h-8 p-0 border border-gray-300 rounded-md overflow-hidden cursor-pointer dark:border-gray-600"
        />
      </div>

      <div class="flex justify-end pt-1">
        <button type="submit" class="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm">
          Criar Grupo
        </button>
      </div>
    </form>

    <div
      v-if="name.length > 0"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center justify-center transition-all duration-200"
      :style="{ borderColor: color, borderWidth: '2px', borderStyle: 'solid' }"
    >
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1" :style="{ color: color }">
        {{ name }}
      </h4>
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        :style="{ backgroundColor: color + '33', color: color }"
      >
        {{ name }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTasksStore } from '../stores/tasks';

const store = useTasksStore();

const name = ref('');
const color = ref('#6366f1'); // padrão

const emit = defineEmits(['group-created']);

const handleSubmit = () => {
  if (!name.value.trim()) { // Usar .trim() para verificar espaços em branco
    alert('Por favor, insira um nome para o grupo.');
    return;
  }
  store.addTaskGroup({ name: name.value.trim(), color: color.value }); // Salva o nome sem espaços extras
  name.value = '';
  color.value = '#6366f1';
  emit('group-created');
};
</script>