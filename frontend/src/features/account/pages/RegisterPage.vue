<script setup lang="ts">
import { ref } from 'vue'
import { IonButton, IonInput } from '@ionic/vue'
import AuthPlaceholderPage from '@/features/account/pages/AuthPlaceholderPage.vue'
import { register } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'

const displayName = ref('')
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const error = ref('')
const notice = ref('')

async function submit() {
  isSubmitting.value = true
  error.value = ''
  notice.value = ''
  try {
    await register({ displayName: displayName.value, email: email.value, password: password.value })
    notice.value = 'Cuenta creada. El backend local preparó un mensaje de verificación; consulta backend/.local/mailbox.jsonl para copiar el token y verificarla.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthPlaceholderPage
    title="Crear cuenta"
    heading="Empieza a jugar en comunidad"
    description="Crea una cuenta con correo electrónico y verifícalo para participar en MeepleWorld."
    link-label="Ya tengo cuenta · Iniciar sesión"
    link-to="/acceso/iniciar-sesion"
  >
    <form class="api-form" @submit.prevent="submit">
      <IonInput v-model="displayName" label="Nombre visible" label-placement="stacked" fill="outline" autocomplete="name" :maxlength="120" required />
      <IonInput v-model="email" type="email" label="Correo electrónico" label-placement="stacked" fill="outline" autocomplete="email" required />
      <IonInput v-model="password" type="password" label="Contraseña" label-placement="stacked" fill="outline" autocomplete="new-password" :minlength="12" :maxlength="128" required />
      <p class="field-hint">Usa al menos 12 caracteres.</p>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <IonButton type="submit" expand="block" :disabled="isSubmitting || !displayName || !email || password.length < 12">
        {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
      </IonButton>
      <IonButton v-if="notice" type="button" expand="block" fill="outline" router-link="/acceso/verificar-correo">
        Ya tengo el token
      </IonButton>
    </form>
  </AuthPlaceholderPage>
</template>
