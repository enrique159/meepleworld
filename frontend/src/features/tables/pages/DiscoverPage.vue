<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonLabel, IonPage, IonSegment, IonSegmentButton } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useDiscoveryStore } from '@/features/tables/stores/discovery.store'
import { listTables } from '@/services/api/tables.api'
import { errorMessage } from '@/services/api/errors'
import type { TableSummary } from '@/services/api/api.types'

const discovery = useDiscoveryStore()
const tables = ref<TableSummary[]>([])
const isLoading = ref(false)
const error = ref('')
const total = ref(0)
const hasFilters = computed(() => Boolean(discovery.city || discovery.query))

async function search() {
  isLoading.value = true
  error.value = ''
  try {
    const page = await listTables({ city: discovery.city.trim() || undefined, q: discovery.query.trim() || undefined, availableOnly: true })
    tables.value = page.items
    total.value = page.total
  } catch (cause) {
    error.value = errorMessage(cause)
    tables.value = []
  } finally {
    isLoading.value = false
  }
}

function dateLabel(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(value))
}

onIonViewWillEnter(() => void search())
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mesas"
      eyebrow="Jugar se disfruta más en compañía"
      heading="Encuentra tu próxima mesa"
      description="Descubre encuentros cerca de ti, conoce los juegos y consulta las condiciones antes de pedir un lugar."
    >
      <form class="discovery-controls" aria-label="Filtros de mesas" @submit.prevent="search">
        <IonInput
          v-model="discovery.city"
          label="Ciudad"
          label-placement="stacked"
          placeholder="Ej. Mazatlán"
          fill="outline"
          autocomplete="address-level2"
        />
        <IonInput v-model="discovery.query" label="Juego o palabra clave" label-placement="stacked" placeholder="Título o descripción" fill="outline" />
        <IonSegment value="list" aria-label="Vista de resultados">
          <IonSegmentButton value="list">
            <IonLabel>Listado</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="map" disabled>
            <IonLabel>Mapa después</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <IonButton type="submit" :disabled="isLoading">{{ isLoading ? 'Buscando…' : 'Buscar mesas' }}</IonButton>
      </form>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-else-if="isLoading" class="field-hint" role="status">Cargando mesas…</p>
      <p v-else class="field-hint">{{ total }} mesas disponibles{{ hasFilters ? ' con estos filtros' : '' }}.</p>
      <p v-if="!tables.length && !isLoading && !error" class="field-hint">No hay mesas disponibles que coincidan con la búsqueda.</p>
      <div v-if="tables.length" class="item-grid table-grid">
        <IonCard v-for="table in tables" :key="table.id" class="data-card">
          <IonCardHeader>
            <IonCardTitle>{{ table.title }}</IonCardTitle>
            <p class="card-subtitle">{{ table.city }} · {{ dateLabel(table.startsAt, table.timeZone) }}</p>
          </IonCardHeader>
          <IonCardContent>
            <p>{{ table.description }}</p>
            <p>{{ table.availableSeats }} de {{ table.offeredSeats }} lugares adicionales disponibles</p>
            <p>{{ table.feeMxn === '0.00' ? 'Gratis' : `$${table.feeMxn} MXN por persona` }} · {{ table.accessMode === 'open' ? 'Acceso abierto' : 'Requiere aprobación' }}</p>
            <p v-if="table.games.length" class="game-tags">{{ table.games.map((game) => game.name).join(' · ') }}</p>
            <p v-if="table.host" class="card-subtitle">Anfitrión: {{ table.host.displayName }}</p>
            <p class="card-subtitle">{{ table.locationApproximate ? 'La ubicación pública es aproximada.' : 'Dirección pública.' }}</p>
            <IonButton :router-link="{ name: 'table-detail', params: { id: table.id } }" fill="outline">Ver mesa</IonButton>
          </IonCardContent>
        </IonCard>
      </div>
      <IonButton router-link="/app/mesas/nueva" expand="block" fill="outline">
        Publicar una mesa
      </IonButton>
      <IonButton v-if="hasFilters" fill="clear" @click="discovery.resetFilters(); search()">
        Limpiar filtros
      </IonButton>
    </WorkspacePage>
  </IonPage>
</template>
