import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { GameSummary } from '@/shared/types/domain.types'

export const useLibraryStore = defineStore('library', () => {
  const games = ref<GameSummary[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  function replaceGames(nextGames: GameSummary[]) {
    games.value = nextGames
  }

  function clearLibrary() {
    games.value = []
    errorMessage.value = null
  }

  return { games, isLoading, errorMessage, replaceGames, clearLibrary }
})
