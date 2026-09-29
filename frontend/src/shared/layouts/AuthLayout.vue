<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue'

defineProps<{
  title: string
  heading: string
  description: string
  linkLabel: string
  linkTo: string
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
      <p class="auth-pending-note">El servicio de cuentas aún no está conectado.</p>
      <IonButton expand="block" router-link="/app/mesas" class="auth-back-button">
        Volver a explorar mesas
      </IonButton>
      <IonButton expand="block" fill="clear" :router-link="linkTo">
        {{ linkLabel }}
      </IonButton>
    </section>
  </IonContent>
</template>
