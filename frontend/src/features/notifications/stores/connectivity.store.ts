import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConnectivityStore = defineStore('connectivity', () => {
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  let listening = false

  function updateOnlineState() {
    isOnline.value = navigator.onLine
  }

  function startListening() {
    if (listening || typeof window === 'undefined') return
    listening = true
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)
  }

  function stopListening() {
    if (!listening || typeof window === 'undefined') return
    listening = false
    window.removeEventListener('online', updateOnlineState)
    window.removeEventListener('offline', updateOnlineState)
  }

  return { isOnline, startListening, stopListening }
})
