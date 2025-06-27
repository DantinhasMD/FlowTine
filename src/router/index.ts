import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('../views/TasksView.vue')
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/CalendarView.vue')
    },
    {
      path: '/goals',
      name: 'Goals',
      component: () => import('../views/GoalsView.vue')
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('../views/GroupsView.vue')
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('../views/StatisticsView.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/ChatView.vue')
    }
  ]
})

export default router