<script setup lang="ts">
import { addCircleOutline } from 'ionicons/icons'
import { IonPage } from '@ionic/vue'
import FeatureEmptyState from '@/shared/components/FeatureEmptyState.vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Publicar una mesa"
      eyebrow="Organiza una partida"
      heading="Invita a más personas a jugar"
      description="Prepara el encuentro, define los lugares disponibles y elige cómo compartir la ubicación."
    >
      <FeatureEmptyState
        :icon="addCircleOutline"
        title="Publicar mesas estará disponible pronto"
        description="El formulario se habilitará cuando estén listos los servicios de cuenta y mesas."
      />
    </WorkspacePage>
  </IonPage>
</template>
