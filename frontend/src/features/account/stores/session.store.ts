import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface SessionUser {
  id: string
  displayName: string
  emailVerified: boolean
}

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)

  function setSession(token: string, sessionUser: SessionUser) {
    accessToken.value = token
    user.value = sessionUser
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
  }

  return { accessToken, user, isAuthenticated, setSession, clearSession }
})
