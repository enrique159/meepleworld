<script setup lang="ts">
import { IonButton, IonInput, IonPage, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue'
import { compassOutline } from 'ionicons/icons'
import FeatureEmptyState from '@/shared/components/FeatureEmptyState.vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useDiscoveryStore, type DiscoveryView } from '@/features/tables/stores/discovery.store'

const discovery = useDiscoveryStore()

function setView(value: string | number | undefined) {
  if (value === 'list' || value === 'map') discovery.view = value satisfies DiscoveryView
}
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mesas"
      eyebrow="Jugar se disfruta más en compañía"
      heading="Encuentra tu próxima mesa"
      description="Descubre encuentros cerca de ti, conoce los juegos y consulta las condiciones antes de pedir un lugar."
    >
      <section class="discovery-controls" aria-label="Filtros de mesas">
        <IonInput
          v-model="discovery.city"
          label="Ciudad"
          label-placement="stacked"
          placeholder="Ej. Mazatlán"
          fill="outline"
          autocomplete="address-level2"
        />
        <IonSegment :value="discovery.view" aria-label="Vista de resultados" @ion-change="setView($event.detail.value)">
          <IonSegmentButton value="list">
            <IonLabel>Listado</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="map">
            <IonLabel>Mapa</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </section>
      <FeatureEmptyState
        :icon="compassOutline"
        title="Las mesas aparecerán aquí"
        description="La navegación y los filtros ya están preparados. El listado y el mapa se conectarán cuando exista la API de mesas."
      />
      <IonButton v-if="discovery.city" fill="clear" @click="discovery.resetFilters">
        Limpiar ciudad
      </IonButton>
    </WorkspacePage>
  </IonPage>
</template>
