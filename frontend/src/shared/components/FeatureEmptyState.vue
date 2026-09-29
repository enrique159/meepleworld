<script setup lang="ts">
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/vue'

defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <IonCard class="feature-empty-card">
    <div class="feature-empty-icon" aria-hidden="true">
      <IonIcon :icon="icon" />
    </div>
    <IonCardHeader>
      <IonCardTitle>{{ title }}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <p>{{ description }}</p>
    </IonCardContent>
  </IonCard>
</template>
