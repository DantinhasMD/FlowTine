<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Assistente Organizacional</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Método atual: {{ currentMethodName }}
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="askDailyQuestion"
          class="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
        >
          Pergunta do Dia
        </button>
        <button
          @click="clearChat"
          class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
        >
          Limpar Chat
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="{
          'flex justify-end': message.type === 'user',
          'flex justify-start': message.type === 'bot'
        }"
        class="animate-fade-in"
      >
        <div
          :class="{
            'bg-primary-600 text-white': message.type === 'user',
            'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': message.type === 'bot'
          }"
          class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm"
        >
          <p class="text-sm">{{ message.content }}</p>
          <p class="text-xs opacity-70 mt-1">
            {{ formatTime(message.timestamp) }}
          </p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="flex justify-start animate-fade-in">
        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="action in quickActions"
          :key="action.text"
          @click="sendMessage(action.text)"
          class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {{ action.text }}
        </button>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-6 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-2">
        <input
          v-model="messageInput"
          @keyup.enter="sendUserMessage"
          :disabled="isTyping"
          type="text"
          placeholder="Digite sua mensagem..."
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
        />
        <button
          @click="sendUserMessage"
          :disabled="!messageInput.trim() || isTyping"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send } from 'lucide-vue-next'
import { useChatbotStore } from '../stores/chatbot'

const chatbotStore = useChatbotStore()

const messageInput = ref('')

const messages = computed(() => chatbotStore.messages)
const isTyping = computed(() => chatbotStore.isTyping)
const currentMethodName = computed(() => {
  const method = chatbotStore.organizationMethods[chatbotStore.currentMethod]
  return method?.name || 'Não definido'
})

const quickActions = [
  { text: 'Como posso melhorar minha produtividade?' },
  { text: 'Estou me sentindo sobrecarregado' },
  { text: 'Ajuda com priorização' },
  { text: 'Dicas do método atual' },
  { text: 'Mudança de método' }
]

const sendUserMessage = async () => {
  const message = messageInput.value.trim()
  if (!message || isTyping.value) return

  chatbotStore.addMessage(message, 'user')
  messageInput.value = ''

  // Get bot response
  const response = await chatbotStore.getBotResponse(message)
  chatbotStore.addMessage(response, 'bot')

  // Scroll to bottom
  await nextTick()
  scrollToBottom()
}

const sendMessage = async (message: string) => {
  chatbotStore.addMessage(message, 'user')
  
  const response = await chatbotStore.getBotResponse(message)
  chatbotStore.addMessage(response, 'bot')

  await nextTick()
  scrollToBottom()
}

const askDailyQuestion = async () => {
  const question = chatbotStore.getDailyQuestion()
  chatbotStore.addMessage(question, 'bot')
  
  await nextTick()
  scrollToBottom()
}

const clearChat = () => {
  if (confirm('Tem certeza que deseja limpar o histórico do chat?')) {
    chatbotStore.clearMessages()
  }
}

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm', { locale: ptBR })
}

const scrollToBottom = () => {
  const container = document.querySelector('.overflow-y-auto')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

onMounted(() => {
  chatbotStore.loadMessages()
  nextTick(() => scrollToBottom())
})
</script>