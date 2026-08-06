import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/terminos',
      name: 'terms',
      component: () => import('../views/LegalView.vue'),
      props: { kind: 'terms' },
    },
    {
      path: '/privacidad',
      name: 'privacy',
      component: () => import('../views/LegalView.vue'),
      props: { kind: 'privacy' },
    },
    {
      path: '/auth',
      component: () => import('../layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
        { path: 'register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../views/auth/ForgotPasswordView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('../views/auth/ResetPasswordView.vue'),
        },
        { path: 'verify', name: 'verify-email', component: () => import('../views/auth/VerifyEmailView.vue') },
      ],
    },
    { path: '/invitations/:token', name: 'invitation', component: () => import('../views/InvitationView.vue') },
    {
      path: '/events',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'events', component: () => import('../views/events/EventsView.vue') },
        { path: 'new', name: 'event-new', component: () => import('../views/events/EventFormView.vue') },
        { path: ':eventId', redirect: (route) => `/events/${String(route.params.eventId)}/guests` },
        {
          path: ':eventId/guests',
          name: 'event-guests',
          component: () => import('../views/events/EventGuestsView.vue'),
        },
        {
          path: ':eventId/tree',
          name: 'event-tree',
          component: () => import('../views/events/EventTreeView.vue'),
        },
        {
          path: ':eventId/settings',
          name: 'event-settings',
          component: () => import('../views/events/EventSettingsView.vue'),
        },
      ],
    },
    {
      path: '/account',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [{ path: '', name: 'account', component: () => import('../views/AccountSettingsView.vue') }],
    },
    {
      path: '/join',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [{ path: '', name: 'join', component: () => import('../views/JoinEventView.vue') }],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()
  if (to.meta.requiresAuth && !auth.user) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly && auth.user) return { name: 'events' }
})

export default router
