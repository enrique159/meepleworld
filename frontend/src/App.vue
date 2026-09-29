<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useConnectivityStore } from '@/features/notifications/stores/connectivity.store'

const connectivity = useConnectivityStore()

onMounted(connectivity.startListening)
onBeforeUnmount(connectivity.stopListening)
</script>

<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>
