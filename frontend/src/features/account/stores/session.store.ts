import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginRequest, logout as logoutRequest, refreshSession } from '@/services/api/account.api'
import type { AuthUser } from '@/services/api/api.types'
import { useLibraryStore } from '@/features/library/stores/library.store'
import { useDiscoveryStore } from '@/features/tables/stores/discovery.store'
import { setSessionRefreshHandlers } from '@/services/api/httpClient'

export type SessionUser = AuthUser

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)
  const isRestoring = ref(false)
  const didRestore = ref(false)
  let restorePromise: Promise<void> | undefined

  function setSession(token: string, sessionUser: SessionUser) {
    accessToken.value = token
    user.value = sessionUser
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
    useLibraryStore().clearLibrary()
    useDiscoveryStore().clearParticipations()
  }

  async function signIn(email: string, password: string) {
    const session = await loginRequest({ email, password })
    setSession(session.accessToken, session.user)
    return session.user
  }

  async function restoreSession() {
    if (didRestore.value) return
    if (restorePromise) return restorePromise
    isRestoring.value = true
    restorePromise = (async () => {
      try {
        const session = await refreshSession()
        setSession(session.accessToken, session.user)
      } catch {
        clearSession()
      } finally {
        didRestore.value = true
        isRestoring.value = false
        restorePromise = undefined
      }
    })()
    return restorePromise
  }

  async function signOut() {
    const token = accessToken.value
    clearSession()
    if (!token) return
    try {
      await logoutRequest(token)
    } catch {
      // The local session is cleared even if the API is unavailable.
    } finally {
      clearSession()
    }
  }

  setSessionRefreshHandlers(
    (session) => setSession(session.accessToken, session.user),
    clearSession,
  )

  return { accessToken, user, isAuthenticated, isRestoring, didRestore, setSession, clearSession, signIn, signOut, restoreSession }
})
