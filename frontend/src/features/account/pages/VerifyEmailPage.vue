<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonButton, IonInput } from '@ionic/vue'
import AuthPlaceholderPage from '@/features/account/pages/AuthPlaceholderPage.vue'
import { verifyEmail } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'

const route = useRoute()
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const isSubmitting = ref(false)
const error = ref('')
const notice = ref('')

async function submit() {
  isSubmitting.value = true
  error.value = ''
  notice.value = ''
  try {
    await verifyEmail(token.value.trim())
    notice.value = 'Correo verificado. Ya puedes iniciar sesión.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthPlaceholderPage
    title="Verificar correo"
    heading="Confirma tu correo electrónico"
    description="Pega el token del mensaje de verificación preparado por el backend."
    link-label="Ir a iniciar sesión"
    link-to="/acceso/iniciar-sesion"
  >
    <form class="api-form" @submit.prevent="submit">
      <IonInput v-model="token" label="Token de verificación" label-placement="stacked" fill="outline" autocomplete="one-time-code" :minlength="40" :maxlength="64" required />
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <IonButton type="submit" expand="block" :disabled="isSubmitting || token.length < 40">
        {{ isSubmitting ? 'Verificando…' : 'Verificar correo' }}
      </IonButton>
    </form>
  </AuthPlaceholderPage>
</template>
