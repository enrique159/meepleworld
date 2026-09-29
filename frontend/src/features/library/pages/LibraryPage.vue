<script setup lang="ts">
import { libraryOutline } from 'ionicons/icons'
import { IonPage } from '@ionic/vue'
import FeatureEmptyState from '@/shared/components/FeatureEmptyState.vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useLibraryStore } from '@/features/library/stores/library.store'

const library = useLibraryStore()
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mi biblioteca"
      eyebrow="Tu colección"
      heading="Tus juegos, listos para la próxima partida"
      description="Registra tus juegos y elige cuáles quieres proponer cuando organices una mesa."
    >
      <FeatureEmptyState
        :icon="libraryOutline"
        :title="library.games.length ? 'Tu biblioteca está lista' : 'Tu biblioteca aparecerá aquí'"
        description="El registro manual y la importación pública de BoardGameGeek estarán disponibles al conectar el backend."
      />
    </WorkspacePage>
  </IonPage>
</template>
