<script setup lang="ts">
import { ref } from 'vue'
import { onIonViewWillEnter, IonButton, IonInput, IonPage } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useSessionStore } from '@/features/account/stores/session.store'
import { getMyProfile, updateMyProfile } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'

const session = useSessionStore()
const displayName = ref('')
const city = ref('')
const avatarUrl = ref('')
const email = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const notice = ref('')

async function loadProfile() {
  if (!session.accessToken) return
  isLoading.value = true
  error.value = ''
  try {
    const profile = await getMyProfile(session.accessToken)
    session.setSession(session.accessToken, profile)
    displayName.value = profile.displayName
    city.value = profile.city ?? ''
    avatarUrl.value = profile.avatarUrl ?? ''
    email.value = profile.email
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isLoading.value = false
  }
}

async function saveProfile() {
  if (!session.accessToken) return
  isSaving.value = true
  error.value = ''
  notice.value = ''
  try {
    const updated = await updateMyProfile(session.accessToken, {
      displayName: displayName.value,
      city: city.value || null,
      avatarUrl: avatarUrl.value || null,
    })
    session.setSession(session.accessToken, updated)
    notice.value = 'Perfil actualizado.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSaving.value = false
  }
}

onIonViewWillEnter(() => void loadProfile())
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mi perfil"
      eyebrow="Tu espacio"
      heading="Perfil y reputación"
      description="Administra el nombre, la ciudad y la imagen que compartes con la comunidad."
    >
      <form class="api-form form-panel" @submit.prevent="saveProfile">
        <IonInput v-model="displayName" label="Nombre visible" label-placement="stacked" fill="outline" :maxlength="120" required />
        <IonInput v-model="email" label="Correo electrónico" label-placement="stacked" fill="outline" readonly />
        <IonInput v-model="city" label="Ciudad" label-placement="stacked" fill="outline" :maxlength="120" />
        <IonInput v-model="avatarUrl" type="url" label="URL de avatar" label-placement="stacked" fill="outline" :maxlength="2048" />
        <p v-if="isLoading" class="form-message" role="status">Cargando perfil…</p>
        <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
        <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
        <IonButton type="submit" expand="block" :disabled="isSaving || isLoading || !displayName">
          {{ isSaving ? 'Guardando…' : 'Guardar cambios' }}
        </IonButton>
      </form>
      <p class="field-hint">Las calificaciones aún no tienen endpoints en el backend.</p>
    </WorkspacePage>
  </IonPage>
</template>
