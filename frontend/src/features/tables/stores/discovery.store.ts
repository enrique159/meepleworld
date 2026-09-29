import { ref } from 'vue'
import { defineStore } from 'pinia'

export type DiscoveryView = 'list' | 'map'

export const useDiscoveryStore = defineStore('table-discovery', () => {
  const view = ref<DiscoveryView>('list')
  const query = ref('')
  const city = ref('')

  function resetFilters() {
    query.value = ''
    city.value = ''
    view.value = 'list'
  }

  return { view, query, city, resetFilters }
})
