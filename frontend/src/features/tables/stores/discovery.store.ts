import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TableParticipation } from '@/services/api/api.types'

export type DiscoveryView = 'list' | 'map'

export const useDiscoveryStore = defineStore('table-discovery', () => {
  const view = ref<DiscoveryView>('list')
  const query = ref('')
  const city = ref('')
  const myParticipations = ref<Record<string, TableParticipation>>({})

  function resetFilters() {
    query.value = ''
    city.value = ''
    view.value = 'list'
  }

  function rememberParticipation(participation: TableParticipation) {
    myParticipations.value[participation.tableId] = participation
  }

  function forgetParticipation(tableId: string) {
    delete myParticipations.value[tableId]
  }

  function clearParticipations() {
    myParticipations.value = {}
  }

  return { view, query, city, myParticipations, resetFilters, rememberParticipation, forgetParticipation, clearParticipations }
})
