<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPage } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { getPublicProfile } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'
import type { PublicProfile } from '@/services/api/api.types'

const route = useRoute()
const profile = ref<PublicProfile | null>(null)
const isLoading = ref(false)
const error = ref('')

async function load() {
  const id = String(route.params.id)
  isLoading.value = true
  error.value = ''
  try {
    profile.value = await getPublicProfile(id)
  } catch (cause) {
    profile.value = null
    error.value = errorMessage(cause)
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, () => void load(), { immediate: true })
</script>

<template>
  <IonPage>
    <WorkspacePage title="Perfil público" eyebrow="Comunidad" heading="Perfil de jugador" description="Información pública compartida por esta persona.">
      <p v-if="isLoading" class="form-message" role="status">Cargando perfil…</p>
      <p v-else-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <IonCard v-else-if="profile" class="feature-empty-card">
        <IonCardHeader><IonCardTitle>{{ profile.displayName }}</IonCardTitle></IonCardHeader>
        <IonCardContent>
          <p>{{ profile.city || 'Ciudad no indicada' }}</p>
          <p>Miembro desde {{ new Date(profile.memberSince).toLocaleDateString('es-MX') }}</p>
        </IonCardContent>
      </IonCard>
    </WorkspacePage>
  </IonPage>
</template>
