<script setup lang="ts">
import { IonInput, IonLabel, IonPage, IonSegment, IonSegmentButton } from '@ionic/vue'
import { storefrontOutline } from 'ionicons/icons'
import FeatureEmptyState from '@/shared/components/FeatureEmptyState.vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useMarketplaceStore, type MarketplaceKind } from '@/features/marketplace/stores/marketplace.store'

const marketplace = useMarketplaceStore()

function setKind(value: string | number | undefined) {
  if (value === 'all' || value === 'sale' || value === 'wanted') {
    marketplace.kind = value satisfies MarketplaceKind
  }
}
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Marketplace"
      eyebrow="Juegos que cambian de mesa"
      heading="Compra, vende o encuentra un juego"
      description="Explora anuncios de la comunidad y coordina los detalles directamente con cada persona."
    >
      <section class="discovery-controls" aria-label="Filtros del marketplace">
        <IonInput
          v-model="marketplace.city"
          label="Ciudad"
          label-placement="stacked"
          placeholder="Cualquier ciudad"
          fill="outline"
          autocomplete="address-level2"
        />
        <IonSegment :value="marketplace.kind" aria-label="Tipo de anuncio" @ion-change="setKind($event.detail.value)">
          <IonSegmentButton value="all"><IonLabel>Todos</IonLabel></IonSegmentButton>
          <IonSegmentButton value="sale"><IonLabel>En venta</IonLabel></IonSegmentButton>
          <IonSegmentButton value="wanted"><IonLabel>Busco</IonLabel></IonSegmentButton>
        </IonSegment>
      </section>
      <FeatureEmptyState
        :icon="storefrontOutline"
        title="Los anuncios aparecerán aquí"
        description="Los filtros iniciales están preparados. La búsqueda y las conversaciones se conectarán al backend cuando esté disponible."
      />
    </WorkspacePage>
  </IonPage>
</template>
