import { createRouter, createWebHistory } from '@ionic/vue-router'
import MainLayout from '@/shared/layouts/MainLayout.vue'
import { useSessionStore } from '@/features/account/stores/session.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/app/mesas',
    },
    {
      path: '/app',
      component: MainLayout,
      redirect: '/app/mesas',
      children: [
        {
          path: 'mesas',
          name: 'tables',
          component: () => import('@/features/tables/pages/DiscoverPage.vue'),
          meta: { title: 'Mesas' },
        },
        {
          path: 'mesas/nueva',
          name: 'create-table',
          component: () => import('@/features/tables/pages/CreateTablePage.vue'),
          meta: { title: 'Publicar una mesa', requiresAuth: true },
        },
        {
          path: 'mesas/:id',
          name: 'table-detail',
          component: () => import('@/features/tables/pages/TableDetailPage.vue'),
          meta: { title: 'Detalle de mesa' },
        },
        {
          path: 'marketplace',
          name: 'marketplace',
          component: () => import('@/features/marketplace/pages/MarketplacePage.vue'),
          meta: { title: 'Marketplace' },
        },
        {
          path: 'biblioteca',
          name: 'library',
          component: () => import('@/features/library/pages/LibraryPage.vue'),
          meta: { title: 'Mi biblioteca', requiresAuth: true },
        },
        {
          path: 'perfil',
          name: 'profile',
          component: () => import('@/features/account/pages/ProfilePage.vue'),
          meta: { title: 'Mi perfil', requiresAuth: true },
        },
        {
          path: 'personas/:id',
          name: 'public-profile',
          component: () => import('@/features/account/pages/PublicProfilePage.vue'),
          meta: { title: 'Perfil público' },
        },
      ],
    },
    {
      path: '/acceso',
      redirect: '/acceso/iniciar-sesion',
    },
    {
      path: '/acceso/iniciar-sesion',
      name: 'sign-in',
      component: () => import('@/features/account/pages/SignInPage.vue'),
      meta: { title: 'Iniciar sesión' },
    },
    {
      path: '/acceso/crear-cuenta',
      name: 'register',
      component: () => import('@/features/account/pages/RegisterPage.vue'),
      meta: { title: 'Crear cuenta' },
    },
    {
      path: '/acceso/recuperar-acceso',
      name: 'recover-access',
      component: () => import('@/features/account/pages/RecoverAccessPage.vue'),
      meta: { title: 'Recuperar acceso' },
    },
    {
      path: '/acceso/verificar-correo',
      name: 'verify-email',
      component: () => import('@/features/account/pages/VerifyEmailPage.vue'),
      meta: { title: 'Verificar correo' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const session = useSessionStore()
  if (session.isAuthenticated) return true

  return {
    name: 'sign-in',
    query: { redirect: to.fullPath },
  }
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'MeepleWorld'
  document.title = title + ' · MeepleWorld'
})

export default router
