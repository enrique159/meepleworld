<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonButton, IonInput } from '@ionic/vue'
import AuthPlaceholderPage from '@/features/account/pages/AuthPlaceholderPage.vue'
import { requestPasswordReset, resetPassword } from '@/services/api/account.api'
import { errorMessage } from '@/services/api/errors'

const route = useRoute()
const email = ref('')
const newPassword = ref('')
const isSubmitting = ref(false)
const error = ref('')
const notice = ref('')
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')

async function submit() {
  isSubmitting.value = true
  error.value = ''
  notice.value = ''
  try {
    if (token.value) {
      await resetPassword(token.value, newPassword.value)
      notice.value = 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.'
      return
    }
    await requestPasswordReset(email.value)
    notice.value = 'Si la cuenta existe, se preparó un mensaje de recuperación. En desarrollo, consulta backend/.local/mailbox.jsonl.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthPlaceholderPage
    title="Recuperar acceso"
    heading="Recupera el acceso a tu cuenta"
    description="Solicita un mensaje de recuperación o establece una contraseña nueva si ya tienes el token."
    link-label="Volver a iniciar sesión"
    link-to="/acceso/iniciar-sesion"
  >
    <form class="api-form" @submit.prevent="submit">
      <template v-if="token">
        <IonInput v-model="newPassword" type="password" label="Nueva contraseña" label-placement="stacked" fill="outline" autocomplete="new-password" :minlength="12" :maxlength="128" required />
        <p class="field-hint">Usa al menos 12 caracteres.</p>
      </template>
      <IonInput v-else v-model="email" type="email" label="Correo electrónico" label-placement="stacked" fill="outline" autocomplete="email" required />
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <IonButton type="submit" expand="block" :disabled="isSubmitting || (token ? newPassword.length < 12 : !email)">
        {{ isSubmitting ? 'Enviando…' : (token ? 'Cambiar contraseña' : 'Solicitar recuperación') }}
      </IonButton>
    </form>
  </AuthPlaceholderPage>
</template>
