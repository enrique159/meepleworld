<script setup lang="ts">
import { personCircleOutline } from 'ionicons/icons'
import { IonPage } from '@ionic/vue'
import FeatureEmptyState from '@/shared/components/FeatureEmptyState.vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mi perfil"
      eyebrow="Tu espacio"
      heading="Perfil y reputación"
      description="Administra la información que compartes con la comunidad y consulta tus experiencias."
    >
      <FeatureEmptyState
        :icon="personCircleOutline"
        title="El perfil se habilitará al conectar las cuentas"
        description="La vista está preparada para información pública de perfil y reputación; no muestra datos personales todavía."
      />
    </WorkspacePage>
  </IonPage>
</template>
