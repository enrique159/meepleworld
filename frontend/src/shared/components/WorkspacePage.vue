<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue'
import { useConnectivityStore } from '@/features/notifications/stores/connectivity.store'
import { useSessionStore } from '@/features/account/stores/session.store'

defineProps<{
  title: string
  heading: string
  description: string
  eyebrow?: string
}>()

const connectivity = useConnectivityStore()
const session = useSessionStore()
</script>

<template>
  <IonHeader class="app-header ion-no-border">
    <IonToolbar>
      <IonButtons slot="start">
        <a class="brand-lockup" href="/app/mesas" aria-label="MeepleWorld, ir a mesas">
          <span class="brand-mark" aria-hidden="true">M</span>
          <span class="brand-name">MeepleWorld</span>
        </a>
      </IonButtons>
      <IonTitle class="visually-hidden">{{ title }}</IonTitle>
      <IonButtons slot="end">
        <IonButton v-if="session.isAuthenticated" fill="clear" class="header-login" @click="session.signOut">
          Salir
        </IonButton>
        <IonButton v-else router-link="/acceso/iniciar-sesion" fill="clear" class="header-login">
          Entrar
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent :fullscreen="true" class="workspace-content">
    <div v-if="!connectivity.isOnline" class="connectivity-banner" role="status">
      Sin conexión. El contenido puede estar desactualizado.
    </div>
    <main class="workspace-container">
      <header class="page-intro">
        <p v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</p>
        <h1>{{ heading }}</h1>
        <p class="page-description">{{ description }}</p>
      </header>
      <slot />
    </main>
  </IonContent>
</template>
