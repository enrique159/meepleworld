<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonButton, IonInput } from '@ionic/vue'
import AuthPlaceholderPage from '@/features/account/pages/AuthPlaceholderPage.vue'
import { useSessionStore } from '@/features/account/stores/session.store'
import { resendVerification } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const notice = ref('')
const error = ref('')

async function submit() {
  isSubmitting.value = true
  error.value = ''
  notice.value = ''
  try {
    await session.signIn(email.value, password.value)
    const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirect = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//') ? requestedRedirect : '/app/mesas'
    await router.replace(redirect)
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSubmitting.value = false
  }
}

async function resend() {
  error.value = ''
  notice.value = ''
  try {
    await resendVerification(email.value)
    notice.value = 'Si la cuenta existe y aún no está verificada, se preparó un nuevo mensaje.'
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}
</script>

<template>
  <AuthPlaceholderPage
    title="Iniciar sesión"
    heading="Qué bueno verte de nuevo"
    description="Inicia sesión para solicitar lugares, publicar encuentros y conversar con la comunidad."
    link-label="¿Aún no tienes cuenta? Crear una"
    link-to="/acceso/crear-cuenta"
    secondary-link-label="¿Olvidaste tu contraseña?"
    secondary-link-to="/acceso/recuperar-acceso"
  >
    <form class="api-form" @submit.prevent="submit">
      <IonInput v-model="email" type="email" label="Correo electrónico" label-placement="stacked" fill="outline" autocomplete="email" required />
      <IonInput v-model="password" type="password" label="Contraseña" label-placement="stacked" fill="outline" autocomplete="current-password" required />
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <IonButton type="submit" expand="block" :disabled="isSubmitting || !email || !password">
        {{ isSubmitting ? 'Entrando…' : 'Iniciar sesión' }}
      </IonButton>
      <IonButton type="button" expand="block" fill="clear" :disabled="!email || isSubmitting" @click="resend">
        Reenviar correo de verificación
      </IonButton>
    </form>
  </AuthPlaceholderPage>
</template>
