<template>
  <div class="calendar-view space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Meu Calendário 📅</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="openEventModal()"
        class="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
      >
        + Novo Compromisso
      </button>
    </div>

    <FullCalendar
      ref="fullCalendarRef"
      :options="calendarOptions"
      class="full-calendar-custom"
    />

    <Transition name="fade">
      <div v-if="isEventModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeEventModal()">
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative">
          <button @click="closeEventModal()" class="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ editingEvent ? 'Editar Compromisso' : 'Novo Compromisso' }}
          </h2>
          <form @submit.prevent="saveEvent" class="space-y-4">
            <div>
              <label for="eventTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título *</label>
              <input type="text" id="eventTitle" v-model="eventForm.title" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white">
            </div>
            <div>
              <label for="eventDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <textarea id="eventDescription" v-model="eventForm.description" rows="3"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="eventStart" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Início *</label>
                <input type="datetime-local" id="eventStart" v-model="eventForm.start" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white">
              </div>
              <div>
                <label for="eventEnd" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fim *</label>
                <input type="datetime-local" id="eventEnd" v-model="eventForm.end" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white">
              </div>
            </div>
            <div>
              <label for="eventLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Localização</label>
              <input type="text" id="eventLocation" v-model="eventForm.location"
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                     placeholder="Ex: Sala 5, Escritório">
            </div>
            <div>
              <label for="eventColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
              <input type="color" id="eventColor" v-model="eventForm.color"
                     class="mt-1 block w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 cursor-pointer">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lembretes</label>
              <div class="flex flex-wrap gap-2">
                <div v-for="option in reminderOptions" :key="option.value" class="flex items-center">
                  <input type="checkbox" :id="`reminder-${option.value}`" :value="option.value" v-model="eventForm.reminders"
                         class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                  <label :for="`reminder-${option.value}`" class="ml-2 text-sm text-gray-900 dark:text-white cursor-pointer">{{ option.label }}</label>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeEventModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {{ editingEvent ? 'Atualizar' : 'Criar Compromisso' }}
              </button>
              <button
                v-if="editingEvent"
                type="button"
                @click="deleteEvent(editingEvent.id)"
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
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment'; // Para lidar com datas
import { useTasksStore } from '../stores/tasks';
import { useCalendarStore } from '../stores/calendar'; // Precisamos desta store!
import { type Event } from '../stores/calendar'; // Importe o tipo Event da store

const tasksStore = useTasksStore();
const calendarStore = useCalendarStore();

const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);

const isEventModalOpen = ref(false);
const editingEvent = ref<Event | null>(null); // Armazena o evento que está sendo editado

// Estado do formulário de evento
const eventForm = reactive({
  id: '', // Será preenchido para edição
  title: '',
  description: '',
  start: '', // Formato "YYYY-MM-DDTHH:mm"
  end: '',   // Formato "YYYY-MM-DDTHH:mm"
  location: '',
  color: '#4285F4', // Cor padrão azul do Google
  reminders: [] as number[], // Armazena minutos antes do evento
});

const reminderOptions = [
  { label: '5 min antes', value: 5 },
  { label: '15 min antes', value: 15 },
  { label: '30 min antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 dia antes', value: 1440 },
];

// Computed property para combinar eventos do calendário e tarefas
const allCalendarEvents = computed(() => {
  const events = calendarStore.events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    color: event.color || '#4285F4', // Cor padrão para eventos
    classNames: ['event-item'], // Classe para estilização CSS
    extendedProps: {
      type: 'event',
      description: event.description,
      location: event.location,
      reminders: event.reminders,
    }
  }));

  const tasks = tasksStore.tasks.map(task => {
    // Filtrar tarefas que têm uma data de vencimento válida e não foram concluídas para o calendário
    if (task.dueDate && task.status !== 'done') {
      const taskColor = getTaskColorByPriority(task.priority);
      return {
        id: task.id,
        title: task.title,
        start: task.dueDate,
        end: task.dueDate, // Tarefas são pontos no tempo
        color: taskColor,
        classNames: ['task-item'], // Classe para estilização CSS
        extendedProps: {
          type: 'task',
          description: task.description,
          priority: task.priority,
          status: task.status,
          groupId: task.groupId
        }
      };
    }
    return null;
  }).filter(Boolean); // Remover tarefas nulas (sem dueDate ou concluídas)

  return [...events, ...tasks];
});

// Opções do FullCalendar
const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, momentPlugin],
  initialView: 'dayGridMonth', // Visualização inicial
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // Adicionado listWeek para visualização de lista
    // Para Semestre/Ano, você precisaria de plugins adicionais ou lógica customizada
  },
  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    listWeek: 'Lista'
  },
  locale: 'pt-br', // Localização para português
  editable: true, // Permite arrastar e redimensionar eventos
  selectable: true, // Permite selecionar áreas para criar eventos
  weekends: true, // Exibe finais de semana
  events: allCalendarEvents, // Fonte de eventos
  eventDidMount: (info: any) => {
    // Customização do render de eventos
    // Adicionar um ícone ou estilos baseados no tipo (compromisso vs tarefa)
    const type = info.event.extendedProps.type;
    if (type === 'task') {
      info.el.classList.add('fc-event-task');
      // Adicionar um ícone de checklist, por exemplo
      const icon = document.createElement('span');
      icon.innerHTML = '📋 '; // Ícone de checklist
      icon.style.marginRight = '5px';
      info.el.querySelector('.fc-event-title')?.prepend(icon);
    } else if (type === 'event') {
      info.el.classList.add('fc-event-appointment');
      // Adicionar um ícone de calendário
      const icon = document.createElement('span');
      icon.innerHTML = '🗓️ '; // Ícone de calendário
      icon.style.marginRight = '5px';
      info.el.querySelector('.fc-event-title')?.prepend(icon);
    }
  },
  dateClick: (info: any) => {
    // Ao clicar em uma data, abre o modal de criação de evento
    const clickedDate = info.dateStr.split('T')[0]; // Pega apenas a data
    openEventModal(null, clickedDate); // Passa a data clicada
  },
  eventClick: (info: any) => {
    // Ao clicar em um evento, abre o modal de edição
    const eventType = info.event.extendedProps.type;
    if (eventType === 'event') {
      const eventId = info.event.id;
      const eventToEdit = calendarStore.events.find(e => e.id === eventId);
      if (eventToEdit) {
        openEventModal(eventToEdit);
      }
    } else if (eventType === 'task') {
      // Opcional: Redirecionar para a página de edição da tarefa ou mostrar um modal de detalhes da tarefa
      alert(`Clicou na Tarefa: ${info.event.title}\nStatus: ${info.event.extendedProps.status}`);
      // Você pode implementar uma navegação ou um modal específico para tarefas aqui
    }
  },
  eventDrop: (info: any) => { // Quando um evento é arrastado e solto
    const eventType = info.event.extendedProps.type;
    if (eventType === 'event') {
      const updatedEvent = {
        ...info.event.extendedProps,
        id: info.event.id,
        title: info.event.title,
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
        color: info.event.backgroundColor,
      };
      calendarStore.updateEvent(info.event.id, updatedEvent);
      alert('Compromisso atualizado!');
    } else if (eventType === 'task') {
      // Se permitir arrastar tarefas, atualize a data de vencimento da tarefa
      // tasksStore.updateTask(info.event.id, { dueDate: info.event.start.toISOString() });
      alert('Arraste de tarefas não implementado para atualização. (Apenas para demonstração)');
      // Reverter o evento visualmente se a atualização da tarefa não for permitida ou for complexa
      info.revert();
    }
  },
  eventResize: (info: any) => { // Quando um evento é redimensionado (apenas timeGrid)
    const eventType = info.event.extendedProps.type;
    if (eventType === 'event') {
      const updatedEvent = {
        ...info.event.extendedProps,
        id: info.event.id,
        title: info.event.title,
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
        color: info.event.backgroundColor,
      };
      calendarStore.updateEvent(info.event.id, updatedEvent);
      alert('Compromisso atualizado!');
    } else if (eventType === 'task') {
      alert('Redimensionamento de tarefas não aplicável.');
      info.revert();
    }
  },
  select: (info: any) => { // Quando uma área é selecionada
    // Preenche o formulário com a data/hora inicial e final da seleção
    openEventModal(null, info.startStr, info.endStr);
  }
});

// Funções para lidar com o modal de eventos
const openEventModal = (event: Event | null = null, initialStart?: string, initialEnd?: string) => {
  editingEvent.value = event;
  if (event) {
    Object.assign(eventForm, {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start: formatDateTimeLocal(event.start),
      end: formatDateTimeLocal(event.end),
      location: event.location || '',
      color: event.color || '#4285F4',
      reminders: event.reminders || [],
    });
  } else {
    // Reseta o formulário para um novo evento
    Object.assign(eventForm, {
      id: '',
      title: '',
      description: '',
      start: initialStart ? formatDateTimeLocal(initialStart) : '',
      end: initialEnd ? formatDateTimeLocal(initialEnd) : '',
      location: '',
      color: '#4285F4',
      reminders: [],
    });
  }
  isEventModalOpen.value = true;
};

const closeEventModal = () => {
  isEventModalOpen.value = false;
  editingEvent.value = null;
  // Limpa o formulário
  Object.assign(eventForm, {
    id: '',
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
    color: '#4285F4',
    reminders: [],
  });
  // Opcional: deseleciona qualquer seleção no calendário
  if (fullCalendarRef.value?.getApi()) {
      fullCalendarRef.value.getApi().unselect();
  }
};

const saveEvent = () => {
  if (!eventForm.title || !eventForm.start || !eventForm.end) {
    alert('Título, Data de Início e Data de Fim são obrigatórios!');
    return;
  }

  // Validação de datas
  if (new Date(eventForm.start).getTime() >= new Date(eventForm.end).getTime()) {
    alert('A data de término deve ser posterior à data de início.');
    return;
  }

  const eventData = {
    title: eventForm.title,
    description: eventForm.description,
    start: eventForm.start,
    end: eventForm.end,
    location: eventForm.location,
    color: eventForm.color,
    reminders: eventForm.reminders,
  };

  if (editingEvent.value?.id) {
    calendarStore.updateEvent(editingEvent.value.id, eventData);
    alert('Compromisso atualizado com sucesso!');
  } else {
    calendarStore.addEvent(eventData);
    alert('Compromisso adicionado com sucesso!');
  }
  closeEventModal();
};

const deleteEvent = (id: string) => {
  if (confirm('Tem certeza que deseja excluir este compromisso?')) {
    calendarStore.deleteEvent(id);
    alert('Compromisso excluído!');
    closeEventModal();
  }
};

// Função auxiliar para formatar a data para input[type="datetime-local"]
const formatDateTimeLocal = (isoString: string | Date) => {
  let date;
  if (typeof isoString === 'string') {
      date = new Date(isoString);
  } else {
      date = isoString;
  }
  if (isNaN(date.getTime())) return ''; // Retorna vazio se a data for inválida

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Função para obter cor da tarefa baseada na prioridade (para diferenciação visual)
const getTaskColorByPriority = (priority: string) => {
  switch (priority) {
    case 'high': return '#EF4444'; // Red
    case 'medium': return '#F59E0B'; // Amber
    case 'low': return '#3B82F6'; // Blue
    default: return '#6B7280'; // Gray
  }
};

onMounted(() => {
  // Carrega os eventos e tarefas quando o componente é montado
  calendarStore.loadEvents();
  tasksStore.loadTasks(); // Garante que as tarefas estejam carregadas
});

</script>

<style scoped>
/* Transições para o modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Estilos básicos para o FullCalendar */
.full-calendar-custom {
  max-width: 100%;
  margin: 0 auto;
  font-family: 'Inter', sans-serif; /* Ajuste para sua fonte */
}

/* Ajustes de cores para o tema escuro (exemplo) */
.dark .full-calendar-custom {
  --fc-page-bg-color: #1F2937; /* Cor de fundo da página no dark mode */
  --fc-neutral-bg-color: #374151; /* Cor de fundo neutra, como a dos dias não selecionados */
  --fc-border-color: #4B5563; /* Cor da borda das células */
  --fc-daygrid-event-dot-color: #93C5FD; /* Cor do ponto para eventos do dia */
  --fc-list-event-dot-color: #93C5FD;
  --fc-daygrid-more-link-bg-color: #4B5563; /* Cor do botão "mais" */
  --fc-daygrid-more-link-text-color: #E5E7EB;

  --fc-button-text-color: #E5E7EB;
  --fc-button-bg-color: #4F46E5;
  --fc-button-border-color: #4F46E5;
  --fc-button-hover-bg-color: #6366F1;
  --fc-button-active-bg-color: #4338CA;
  --fc-event-text-color: #FFFFFF; /* Cor do texto do evento */
  --fc-event-bg-color: var(--fc-button-bg-color); /* Cor de fundo do evento padrão */
  --fc-event-border-color: var(--fc-button-bg-color);

  color: #E5E7EB; /* Cor do texto geral do calendário */
}

/* Estilos para diferenciar tarefas de compromissos */
.fc-event-task {
  border-left: 5px solid var(--fc-event-border-color, #6B7280); /* Borda para tarefas */
  background-color: var(--fc-event-bg-color, #D1D5DB); /* Cor de fundo mais neutra para tarefas */
  color: var(--fc-event-text-color, #1F2937); /* Cor do texto da tarefa */
  opacity: 0.9; /* Um pouco de transparência */
}

.dark .fc-event-task {
  background-color: var(--fc-event-bg-color, #4B5563);
  color: var(--fc-event-text-color, #E5E7EB);
}

.fc-event-appointment {
  border-left: 5px solid var(--fc-event-border-color, #4285F4); /* Borda padrão para compromissos */
  background-color: var(--fc-event-bg-color, #4285F4); /* Cor de fundo padrão para compromissos */
  color: var(--fc-event-text-color, #FFFFFF);
}

/* Estilos de título de evento para garantir que os ícones funcionem */
.fc-event-title-container {
    display: flex;
    align-items: center;
}

.fc-event-title {
    display: flex;
    align-items: center;
}

</style>