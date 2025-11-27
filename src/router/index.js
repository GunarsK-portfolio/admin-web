import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true, title: 'Login' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true, title: 'Profile' },
  },
  {
    path: '/skills',
    name: 'Skills',
    component: () => import('../views/Skills.vue'),
    meta: { requiresAuth: true, title: 'Skills' },
  },
  {
    path: '/work-experience',
    name: 'WorkExperience',
    component: () => import('../views/WorkExperience.vue'),
    meta: { requiresAuth: true, title: 'Work Experience' },
  },
  {
    path: '/certifications',
    name: 'Certifications',
    component: () => import('../views/Certifications.vue'),
    meta: { requiresAuth: true, title: 'Certifications' },
  },
  {
    path: '/miniatures',
    name: 'Miniatures',
    component: () => import('../views/Miniatures.vue'),
    meta: { requiresAuth: true, title: 'Miniatures' },
  },
  {
    path: '/portfolio-projects',
    name: 'PortfolioProjects',
    component: () => import('../views/PortfolioProjects.vue'),
    meta: { requiresAuth: true, title: 'Portfolio Projects' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../errors/Forbidden.vue'),
    meta: { title: 'Access Denied' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../errors/NotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} | Admin` : 'Admin'
})

export default router
