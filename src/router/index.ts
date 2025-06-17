import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ChatInterface from '../components/Chat/ChatInterface.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChatInterface,
      meta: { requiresAuth: false, allowGuest: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallback.vue')
    },
    {
      path: '/chat/:conversationId',
      name: 'chat',
      component: ChatInterface,
      meta: { requiresAuth: true }
    },
    {
      path: '/share/:shareId',
      name: 'shared-conversation',
      component: () => import('../views/SharedConversation.vue'),
      meta: { requiresAuth: false }
    },
    // Redirect old routes
    {
      path: '/about',
      redirect: '/'
    }
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  console.log('🛣️ Router guard triggered:', {
    to: to.name,
    from: from.name,
    path: to.path,
    meta: to.meta
  })

  const authStore = useAuthStore()

  // Initialize auth if not already done and not in guest mode
  if (!authStore.session && !authStore.loading && !authStore.isGuestMode) {
    console.log('🔐 Initializing auth...')
    await authStore.initializeAuth()
  }

  // Wait a bit for auth to initialize (but not if in guest mode)
  let attempts = 0
  while (authStore.loading && attempts < 10 && !authStore.isGuestMode) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  console.log('🔐 Auth state after initialization:', {
    isAuthenticated: authStore.isAuthenticated,
    isGuestMode: authStore.isGuestMode,
    hasSession: !!authStore.session,
    loading: authStore.loading
  })

  // Allow access to shared conversations without authentication
  if (to.name === 'shared-conversation') {
    console.log('🔗 Allowing access to shared conversation')
    next()
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated && !authStore.isGuestMode) {
    console.log('🔐 Route requires auth but user not authenticated and not in guest mode, redirecting to login')
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('🔐 Route requires guest but user authenticated, redirecting to home')
    next('/')
  } else if (to.meta.allowGuest && !authStore.isAuthenticated && !authStore.isGuestMode) {
    // Enable guest mode for routes that allow it
    console.log('🎭 Route allows guest and user not authenticated, enabling guest mode')
    authStore.enableGuestMode()
    next()
  } else if (authStore.isGuestMode) {
    // Always allow navigation if in guest mode
    console.log('🎭 In guest mode, allowing navigation')
    next()
  } else {
    console.log('✅ Allowing navigation')
    next()
  }
})

export default router
