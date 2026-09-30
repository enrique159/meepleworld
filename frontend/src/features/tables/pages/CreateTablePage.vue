<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onIonViewWillEnter, IonButton, IonInput, IonPage, IonSelect, IonSelectOption, IonTextarea } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useSessionStore } from '@/features/account/stores/session.store'
import { getLibrary } from '@/services/api/games.api'
import { createTable } from '@/services/api/tables.api'
import { errorMessage } from '@/services/api/errors'
import type { LibraryEntry } from '@/services/api/api.types'

const session = useSessionStore()
const router = useRouter()
const libraryGames = ref<LibraryEntry[]>([])
const title = ref('')
const description = ref('')
const city = ref('')
const startsAt = ref('')
const timeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mazatlan')
const durationMinutes = ref('')
const initialGroupSize = ref(1)
const offeredSeats = ref(4)
const accessMode = ref<'open' | 'approval'>('open')
const locationVisibility = ref<'public' | 'confirmed-only'>('confirmed-only')
const addressLine = ref('')
const latitude = ref('')
const longitude = ref('')
const feeMxn = ref('0.00')
const amenitiesText = ref('')
const instructions = ref('')
const gameIds = ref<string[]>([])
const isLoadingGames = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const verified = computed(() => Boolean(session.user?.emailVerified))

async function loadGames() {
  if (!session.accessToken) return
  isLoadingGames.value = true
  try {
    libraryGames.value = (await getLibrary(session.accessToken)).items
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isLoadingGames.value = false
  }
}

async function submit() {
  if (!session.accessToken) return
  error.value = ''
  if (!gameIds.value.length) {
    error.value = 'Elige al menos un juego de tu biblioteca.'
    return
  }
  if (!startsAt.value || Number.isNaN(new Date(startsAt.value).getTime())) {
    error.value = 'Indica una fecha y hora válidas.'
    return
  }
  isSubmitting.value = true
  try {
    const table = await createTable({
      title: title.value.trim(),
      description: description.value.trim(),
      city: city.value.trim(),
      startsAt: localDateTimeToIso(startsAt.value, timeZone.value),
      timeZone: timeZone.value.trim(),
      durationMinutes: durationMinutes.value ? Number(durationMinutes.value) : null,
      initialGroupSize: Number(initialGroupSize.value),
      offeredSeats: Number(offeredSeats.value),
      accessMode: accessMode.value,
      locationVisibility: locationVisibility.value,
      addressLine: addressLine.value.trim() || null,
      latitude: Number(latitude.value),
      longitude: Number(longitude.value),
      feeMxn: feeMxn.value.trim() || '0.00',
      amenities: amenitiesText.value.split(',').map((value) => value.trim()).filter(Boolean),
      instructions: instructions.value.trim() || null,
      gameIds: gameIds.value,
    }, session.accessToken)
    await router.push({ name: 'table-detail', params: { id: table.id } })
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSubmitting.value = false
  }
}

onIonViewWillEnter(() => void loadGames())

function localDateTimeToIso(value: string, zone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) throw new Error('Indica una fecha y hora válidas.')
  const [, year, month, day, hour, minute] = match
  const desired = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  })
  let instant = desired
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]))
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute))
    const adjusted = desired - (represented - instant)
    if (adjusted === instant) break
    instant = adjusted
  }
  const verifiedParts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]))
  if (Number(verifiedParts.year) !== Number(year) || Number(verifiedParts.month) !== Number(month) ||
      Number(verifiedParts.day) !== Number(day) || Number(verifiedParts.hour) !== Number(hour) || Number(verifiedParts.minute) !== Number(minute)) {
    throw new Error('Esa hora local no existe en la zona horaria elegida. Revisa el horario o la zona.')
  }
  return new Date(instant).toISOString()
}
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Publicar una mesa"
      eyebrow="Organiza una partida"
      heading="Invita a más personas a jugar"
      description="La dirección exacta se solicita al backend solo para el anfitrión o asistentes confirmados cuando la mesa es privada."
    >
      <p v-if="!verified" class="form-message form-error" role="status">Verifica tu correo antes de publicar una mesa.</p>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <form class="api-form form-panel" @submit.prevent="submit">
        <IonInput v-model="title" label="Título" label-placement="stacked" fill="outline" :maxlength="160" required />
        <IonTextarea v-model="description" label="Descripción" label-placement="stacked" fill="outline" :maxlength="5000" :auto-grow="true" required />
        <IonInput v-model="city" label="Ciudad" label-placement="stacked" fill="outline" :maxlength="120" autocomplete="address-level2" required />
        <IonInput v-model="startsAt" type="datetime-local" label="Fecha y hora en la zona elegida" label-placement="stacked" fill="outline" required />
        <IonInput v-model="timeZone" label="Zona horaria IANA" label-placement="stacked" fill="outline" placeholder="America/Mazatlan" required />
        <IonInput v-model="durationMinutes" type="number" label="Duración estimada (minutos)" label-placement="stacked" fill="outline" min="1" max="1440" />

        <div class="form-row">
          <IonInput v-model="initialGroupSize" type="number" label="Personas en el grupo inicial" label-placement="stacked" fill="outline" min="1" max="1000" required />
          <IonInput v-model="offeredSeats" type="number" label="Lugares adicionales" label-placement="stacked" fill="outline" min="0" max="1000" required />
        </div>
        <IonSelect v-model="accessMode" label="Acceso" label-placement="stacked" fill="outline">
          <IonSelectOption value="open">Confirmar si hay lugar</IonSelectOption>
          <IonSelectOption value="approval">Requiere aprobación</IonSelectOption>
        </IonSelect>
        <IonSelect v-model="gameIds" label="Juegos de mi biblioteca" label-placement="stacked" fill="outline" :multiple="true" :disabled="isLoadingGames || !libraryGames.length">
          <IonSelectOption v-for="game in libraryGames" :key="game.id" :value="game.id">{{ game.name }}</IonSelectOption>
        </IonSelect>
        <p v-if="isLoadingGames" class="field-hint">Cargando biblioteca…</p>
        <p v-else-if="!libraryGames.length" class="field-hint">Agrega al menos un juego a tu biblioteca antes de publicar.</p>

        <IonSelect v-model="locationVisibility" label="Privacidad de la dirección" label-placement="stacked" fill="outline">
          <IonSelectOption value="confirmed-only">Solo anfitrión y asistentes confirmados</IonSelectOption>
          <IonSelectOption value="public">Pública</IonSelectOption>
        </IonSelect>
        <IonInput v-model="addressLine" label="Dirección completa" label-placement="stacked" fill="outline" :maxlength="240" :required="locationVisibility === 'confirmed-only'" />
        <p class="field-hint">Para la ubicación, ingresa coordenadas decimales. En mesas privadas, el backend publicará solo un punto aproximado.</p>
        <div class="form-row">
          <IonInput v-model="latitude" type="number" label="Latitud" label-placement="stacked" fill="outline" min="-90" max="90" step="0.0000001" required />
          <IonInput v-model="longitude" type="number" label="Longitud" label-placement="stacked" fill="outline" min="-180" max="180" step="0.0000001" required />
        </div>
        <div class="form-row">
          <IonInput v-model="feeMxn" label="Cuota por persona (MXN)" label-placement="stacked" fill="outline" inputmode="decimal" />
          <IonInput v-model="amenitiesText" label="Amenidades (separadas por comas)" label-placement="stacked" fill="outline" />
        </div>
        <IonTextarea v-model="instructions" label="Indicaciones de llegada" label-placement="stacked" fill="outline" :maxlength="3000" :auto-grow="true" />
        <IonButton type="submit" expand="block" :disabled="!verified || isSubmitting || !title || !description || !city || !latitude || !longitude || !gameIds.length">
          {{ isSubmitting ? 'Publicando…' : 'Publicar mesa' }}
        </IonButton>
      </form>
    </WorkspacePage>
  </IonPage>
</template>
