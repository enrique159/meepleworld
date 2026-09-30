<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue'

defineProps<{
  title: string
  heading: string
  description: string
  linkLabel: string
  linkTo: string
  secondaryLinkLabel?: string
  secondaryLinkTo?: string
}>()
</script>

<template>
  <IonHeader class="ion-no-border">
    <IonToolbar>
      <IonTitle>{{ title }}</IonTitle>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding auth-content">
    <section class="auth-card">
      <a class="brand-lockup auth-brand" href="/app/mesas" aria-label="MeepleWorld, volver a mesas">
        <span class="brand-mark" aria-hidden="true">M</span>
        <span class="brand-name">MeepleWorld</span>
      </a>
      <p class="page-eyebrow">Cuenta MeepleWorld</p>
      <h1>{{ heading }}</h1>
      <p class="page-description">{{ description }}</p>
      <slot />
      <IonButton expand="block" fill="clear" :router-link="linkTo">
        {{ linkLabel }}
      </IonButton>
      <IonButton v-if="secondaryLinkLabel && secondaryLinkTo" expand="block" fill="clear" :router-link="secondaryLinkTo">
        {{ secondaryLinkLabel }}
      </IonButton>
    </section>
  </IonContent>
</template>
