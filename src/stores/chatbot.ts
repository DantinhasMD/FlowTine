import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: string
  // SUGESTÃO: Adicione um campo opcional para respostas rápidas/botões
  // options?: { text: string; payload: string }[]
}

export interface OrganizationMethod {
  id: 'gtd' | 'timeblocking' | 'cyclical' | 'eisenhower'
  name: string
  description: string
  // NOVO: Mensagem de boas-vindas para quando o método é selecionado
  welcomeMessage: string
  dailyQuestions: string[]
  suggestions: string[]
}

export const useChatbotStore = defineStore('chatbot', () => {
  const messages = ref<ChatMessage[]>([])
  const currentMethod = ref<OrganizationMethod['id']>('gtd')
  const isTyping = ref(false)

  const organizationMethods: Record<string, OrganizationMethod> = {
    gtd: {
      id: 'gtd',
      name: 'Getting Things Done (GTD)',
      description: 'Foco em capturar tudo e definir a próxima ação.',
      welcomeMessage: 'Vamos usar o GTD! A ideia é tirar tudo da cabeça e organizar em ações concretas. Para começar, qual é a primeira coisa que vem à sua mente que precisa ser feita?',
      dailyQuestions: [
        'Qual é a "próxima ação" física e visível para a sua tarefa mais importante?',
        'Alguma das suas tarefas pode ser resolvida em menos de 2 minutos? Se sim, o ideal é fazê-la agora.',
        'Vamos revisar sua caixa de entrada de tarefas. O que podemos processar e organizar agora?',
        'O que está na sua mente agora? Vamos fazer um "brain dump" para capturar todas as pendências.'
      ],
      suggestions: [
        'Dica de GTD: Comece listando TUDO o que está na sua cabeça, sem filtros. Depois organizamos.',
        'Lembre-se da regra dos 2 minutos: se uma ação leva menos que isso, faça-a imediatamente.',
        'Para uma tarefa grande, defina apenas a "próxima ação". Ex: para "declarar imposto", a próxima ação pode ser "encontrar os informes de rendimento".'
      ]
    },
    timeblocking: {
      id: 'timeblocking',
      name: 'Time Blocking',
      description: 'Alocação de blocos de tempo específicos para cada tarefa.',
      welcomeMessage: 'Ok, vamos usar o Time Blocking. A chave é dar a cada tarefa um tempo e lugar no seu calendário. Quais são as 3 principais tarefas que você precisa agendar para hoje?',
      dailyQuestions: [
        'Qual tarefa prioritária vamos encaixar no seu próximo bloco de tempo livre?',
        'Em que horário do dia você se sente mais produtivo? Vamos agendar sua tarefa mais difícil para esse período.',
        'Você reservou tempo para pausas e imprevistos no seu calendário hoje?',
        'Vamos definir um bloco de tempo para a sua primeira tarefa. Quanto tempo você acha que ela vai levar?'
      ],
      suggestions: [
        'Dica de Time Blocking: Agrupe tarefas similares em um mesmo bloco, como responder e-mails e mensagens.',
        'Não se esqueça de agendar "blocos de respiro" entre as tarefas para evitar o esgotamento.',
        'Seja realista com o tempo. É melhor superestimar o tempo de uma tarefa do que subestimar.'
      ]
    },
    cyclical: {
      id: 'cyclical',
      name: 'Planejamento Cíclico/Intuitivo',
      description: 'Alinhar tarefas com seu nível de energia e estado emocional.',
      welcomeMessage: 'Vamos seguir um fluxo mais intuitivo. O objetivo é respeitar sua energia. Como você se descreveria agora: com muita energia, com energia média ou com pouca energia?',
      dailyQuestions: [
        'Como está seu nível de energia agora? Vamos escolher uma tarefa que se alinhe a ele.',
        'Que tipo de atividade parece mais atraente no momento: algo criativo, algo analítico ou uma tarefa simples e repetitiva?',
        'Você está se sentindo inspirado? Se sim, este é um ótimo momento para trabalhar em projetos que te apaixonam.',
        'Se sua energia está baixa, que tal focarmos em tarefas mais leves, como organizar arquivos ou limpar sua caixa de e-mails?'
      ],
      suggestions: [
        'Dica do Planejamento Cíclico: Tenha listas de tarefas pré-definidas para cada nível de energia (alta, média, baixa).',
        'Aproveite os picos de energia para as tarefas mais desafiadoras e criativas.',
        'Seja gentil com você mesmo nos dias de baixa energia. Fazer pouco ainda é melhor do que não fazer nada.'
      ]
    },
    eisenhower: {
      id: 'eisenhower',
      name: 'Matriz de Eisenhower',
      description: 'Classificar tarefas por urgência e importância.',
      welcomeMessage: 'Foco na priorização com a Matriz de Eisenhower! Vamos separar o que é ruído do que é resultado. Para começar, me diga uma tarefa que você considera URGENTE e IMPORTANTE para hoje.',
      dailyQuestions: [
        'Qual é a tarefa mais importante e urgente que você deve fazer AGORA?',
        'Existe uma tarefa importante, mas não urgente, que você pode AGENDAR para fazer depois com calma?',
        'O que em sua lista é urgente, mas não tão importante? Isso poderia ser delegado a alguém?',
        'Vamos identificar tarefas que não são nem urgentes nem importantes para que possamos ELIMINÁ-LAS da sua lista.'
      ],
      suggestions: [
        'Dica da Matriz de Eisenhower: O ideal é passar a maior parte do tempo no quadrante "Importante, mas não Urgente". Isso é planejamento.',
        'Se algo é urgente mas não é importante, questione se realmente precisa ser feito por você.',
        'Revise sua lista e seja honesto ao classificar. Evite a "armadilha da urgência", onde tudo parece ser para ontem.'
      ]
    }
  }

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date().toISOString()
    }
    messages.value.push(message)
    saveMessages()
  }

  const getBotResponse = async (userMessage: string): Promise<string> => {
    isTyping.value = true
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const method = organizationMethods[currentMethod.value]
    const lowerMessage = userMessage.toLowerCase()

    let response = ''

    if (lowerMessage.includes('método') || lowerMessage.includes('organização')) {
      response = `Você está usando o método ${method.name}. ${method.description}. Quer que eu explique mais ou sugira outro método?`
    } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('dica')) {
      const randomSuggestion = method.suggestions[Math.floor(Math.random() * method.suggestions.length)]
      response = randomSuggestion
    } else if (lowerMessage.includes('hoje') || lowerMessage.includes('dia') || lowerMessage.includes('começar')) {
      const randomQuestion = method.dailyQuestions[Math.floor(Math.random() * method.dailyQuestions.length)]
      response = randomQuestion
    } else if (lowerMessage.includes('estou') && (lowerMessage.includes('sobrecarregado') || lowerMessage.includes('perdido'))) {
      response = 'Entendo. Sentir-se sobrecarregado é um sinal para simplificar. Que tal escolhermos UMA ÚNICA tarefa para focar agora? Qual seria ela?'
    } else if (lowerMessage.includes('produtivo') || lowerMessage.includes('foco')) {
      response = 'Para melhorar o foco, que tal tentarmos um bloco de trabalho dedicado? A técnica Pomodoro (25 min de foco, 5 de pausa) pode ajudar. Vamos definir uma tarefa para o seu primeiro bloco?'
    } else {
      const responses = [
        `Seguindo o método ${method.name}, qual seria o próximo passo prático?`,
        `Ok, entendi. Usando os princípios do ${method.name}, como podemos avançar a partir daqui?`,
        `Vamos aplicar o ${method.name} a isso. Qual ação podemos tomar agora?`
      ]
      response = responses[Math.floor(Math.random() * responses.length)]
    }

    isTyping.value = false
    return response
  }

  const setOrganizationMethod = (methodId: OrganizationMethod['id']) => {
    currentMethod.value = methodId
    const method = organizationMethods[methodId]
    // Utiliza a nova mensagem de boas-vindas
    addMessage(method.welcomeMessage, 'bot')
  }

  const getDailyQuestion = () => {
    const method = organizationMethods[currentMethod.value]
    const randomQuestion = method.dailyQuestions[Math.floor(Math.random() * method.dailyQuestions.length)]
    return randomQuestion
  }

  const saveMessages = () => {
    localStorage.setItem('chatMessages', JSON.stringify(messages.value))
  }

  const loadMessages = () => {
    const saved = localStorage.getItem('chatMessages')
    if (saved) {
      messages.value = JSON.parse(saved)
    } else {
      addMessage('Olá! Sou seu assistente de organização. Para começar, escolha um método de organização ou me diga como posso te ajudar hoje.', 'bot')
    }
  }

  const clearMessages = () => {
    messages.value = []
    localStorage.removeItem('chatMessages')
    addMessage('Conversa reiniciada! Como posso ajudar você a se organizar hoje?', 'bot')
  }

  return {
    messages,
    currentMethod,
    isTyping,
    organizationMethods,
    addMessage,
    getBotResponse,
    setOrganizationMethod,
    getDailyQuestion,
    loadMessages,
    clearMessages
  }
})