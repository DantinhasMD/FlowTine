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
                @click="deleteEvent(editingEvent!.id)"
                class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md shadow-sm hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
              >
                Excluir
              </button>
            </div>
          </form>
        </div> </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  type CalendarOptions,
  type EventInput,
  type EventClickArg,
  type EventDropArg,
  type DateSelectArg,
} from '@fullcalendar/core';
import { type EventResizeDoneArg } from '@fullcalendar/interaction'; // Corrected import
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useTasksStore } from '../stores/tasks';
import { useCalendarStore, type CalendarEvent } from '../stores/calendar';

const tasksStore = useTasksStore();
const calendarStore = useCalendarStore();

const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const isEventModalOpen = ref(false);
const editingEvent = ref<CalendarEvent | null>(null);

const eventForm = reactive({
  id: '',
  title: '',
  description: '',
  start: '',
  end: '',
  location: '',
  color: '#4F46E5',
  reminders: [] as number[],
});

const reminderOptions = [
  { label: '5 min antes', value: 5 },
  { label: '15 min antes', value: 15 },
  { label: '30 min antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 dia antes', value: 1440 },
];

// Computed que combina eventos e tarefas para o calendário
const allCalendarEvents = computed<EventInput[]>(() => {
  const eventsFromStore = calendarStore.events.map((event): EventInput => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    color: event.color || '#4F46E5',
    classNames: ['event-item', 'fc-event-appointment'],
    extendedProps: {
      type: 'event',
      description: event.description,
      location: event.location,
      reminderMinutes: event.reminderMinutes,
    },
  }));

  const tasksFromStore = tasksStore.tasks
    .map((task) => {
      if (task.dueDate && task.status !== 'done') {
        return {
          id: task.id,
          title: `Tarefa: ${task.title}`,
          start: task.dueDate,
          allDay: true,
          color: getTaskColorByPriority(task.priority),
          classNames: ['task-item', 'fc-event-task'],
          extendedProps: {
            type: 'task',
            description: task.description,
            priority: task.priority,
            status: task.status,
            groupId: task.groupId,
          },
        } as EventInput;
      }
      return null;
    })
    .filter((e): e is EventInput => Boolean(e));

  return [...eventsFromStore, ...tasksFromStore];
});

const calendarOptions = reactive<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  locale: ptBrLocale,
  editable: true,
  selectable: true,
  weekends: true,
  events: [], // Inicializado como array vazio e atualizado via watch
  eventDidMount: (info) => {
    const type = info.event.extendedProps.type;
    const icon = document.createElement('span');
    icon.style.marginRight = '5px';
    if (type === 'task') {
      icon.innerHTML = '📋';
    } else if (type === 'event') {
      icon.innerHTML = '🗓️';
    }
    info.el.querySelector('.fc-event-title')?.prepend(icon);
  },
  eventClick: (info: EventClickArg) => {
    if (info.event.extendedProps.type === 'event') {
      const eventToEdit = calendarStore.events.find(e => e.id === info.event.id);
      if (eventToEdit) openEventModal(eventToEdit);
    } else {
      alert(`Tarefa: ${info.event.title}\nStatus: ${info.event.extendedProps.status}`);
    }
  },
  eventDrop: (info: EventDropArg) => {
    if (info.event.extendedProps.type === 'event') {
      const eventData: Partial<CalendarEvent> = {
        startDate: info.event.startStr,
        endDate: info.event.endStr || info.event.startStr,
      };
      calendarStore.updateEvent(info.event.id, eventData);
    } else {
      info.revert();
      alert('A atualização de tarefas arrastando não é permitida.');
    }
  },
  eventResize: (info: EventResizeDoneArg) => { // Corrected type here
    if (info.event.extendedProps.type === 'event') {
        const eventData: Partial<CalendarEvent> = {
            startDate: info.event.startStr,
            endDate: info.event.endStr,
        };
        calendarStore.updateEvent(info.event.id, eventData);
    } else {
        info.revert();
    }
  },
  select: (info: DateSelectArg) => {
    openEventModal(null, info.startStr, info.endStr);
  },
});

const openEventModal = (event: CalendarEvent | null = null, initialStart?: string, initialEnd?: string) => {
  editingEvent.value = event;
  if (event) {
    Object.assign(eventForm, {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start: formatDateTimeLocal(event.startDate),
      end: formatDateTimeLocal(event.endDate),
      location: event.location || '',
      color: event.color || '#4F46E5',
      reminders: event.reminderMinutes ? [event.reminderMinutes] : [],
    });
  } else {
    const start = initialStart ? formatDateTimeLocal(initialStart) : '';
    const end = initialEnd ? formatDateTimeLocal(initialEnd) : start;
    Object.assign(eventForm, {
      id: '', title: '', description: '', start, end, location: '', color: '#4F46E5', reminders: [],
    });
  }
  isEventModalOpen.value = true;
};

const closeEventModal = () => {
  isEventModalOpen.value = false;
  editingEvent.value = null;
  Object.assign(eventForm, { id: '', title: '', description: '', start: '', end: '', location: '', color: '#4F46E5', reminders: [] });
  fullCalendarRef.value?.getApi().unselect();
};

const saveEvent = () => {
  if (!eventForm.title || !eventForm.start || !eventForm.end) {
    alert('Título, Data de Início e Data de Fim são obrigatórios!');
    return;
  }
  if (new Date(eventForm.start) >= new Date(eventForm.end)) {
    alert('A data de término deve ser posterior à data de início.');
    return;
  }

  const eventData: Partial<CalendarEvent> = {
    title: eventForm.title,
    description: eventForm.description,
    startDate: new Date(eventForm.start).toISOString(),
    endDate: new Date(eventForm.end).toISOString(),
    location: eventForm.location,
    color: eventForm.color,
    reminderMinutes: eventForm.reminders.length > 0 ? Math.min(...eventForm.reminders) : undefined,
    type: 'appointment',
  };

  if (editingEvent.value?.id) {
    calendarStore.updateEvent(editingEvent.value.id, eventData);
    alert('Compromisso atualizado!');
  } else {
    calendarStore.addEvent(eventData as Omit<CalendarEvent, "id" | "createdAt">);
    alert('Compromisso adicionado!');
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

const formatDateTimeLocal = (isoString: string | Date) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const getTaskColorByPriority = (priority: 'high' | 'medium' | 'low' | string) => {
  switch (priority) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#3B82F6';
    default: return '#6B7280';
  }
};

onMounted(() => {
  calendarStore.loadEvents();
  tasksStore.loadTasks();
});

// Atualiza a lista de eventos do calendário reativamente
watch(allCalendarEvents, (newEvents) => {
  calendarOptions.events = newEvents;
});
</script>