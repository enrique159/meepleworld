<script setup lang="ts">
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue'
import { bookOutline, storefrontOutline, personCircleOutline, diceOutline } from 'ionicons/icons'
</script>

<template>
  <IonPage>
    <IonTabs>
      <IonRouterOutlet />
      <IonTabBar slot="bottom" class="main-tab-bar">
        <IonTabButton tab="tables" href="/app/mesas">
          <IonIcon :icon="diceOutline" aria-hidden="true" />
          <IonLabel>Mesas</IonLabel>
        </IonTabButton>
        <IonTabButton tab="marketplace" href="/app/marketplace">
          <IonIcon :icon="storefrontOutline" aria-hidden="true" />
          <IonLabel>Marketplace</IonLabel>
        </IonTabButton>
        <IonTabButton tab="library" href="/app/biblioteca">
          <IonIcon :icon="bookOutline" aria-hidden="true" />
          <IonLabel>Biblioteca</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/app/perfil">
          <IonIcon :icon="personCircleOutline" aria-hidden="true" />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonPage>
</template>
