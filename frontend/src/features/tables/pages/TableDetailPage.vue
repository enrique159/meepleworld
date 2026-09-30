<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonPage, IonSelect, IonSelectOption, IonTextarea, onIonViewWillLeave } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useSessionStore } from '@/features/account/stores/session.store'
import { useDiscoveryStore } from '@/features/tables/stores/discovery.store'
import { acceptParticipationOffer, cancelParticipation, cancelTable, getPrivateTableLocation, getTable, listParticipations, offerParticipation, rejectParticipation, requestParticipation, updateTable } from '@/services/api/tables.api'
import { errorMessage } from '@/services/api/errors'
import type { PrivateTableLocation, TableParticipation, TableSummary } from '@/services/api/api.types'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const discovery = useDiscoveryStore()
const table = ref<TableSummary | null>(null)
const participations = ref<TableParticipation[]>([])
const myParticipation = ref<TableParticipation | null>(null)
const privateLocation = ref<PrivateTableLocation | null>(null)
const requestedSeats = ref(1)
const offerSeats = ref<Record<string, number>>({})
const isLoading = ref(false)
const isActing = ref(false)
const isEditing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editCity = ref('')
const editOfferedSeats = ref(0)
const editFeeMxn = ref('0.00')
const editAccessMode = ref<'open' | 'approval'>('open')
const error = ref('')
const notice = ref('')
const tableId = computed(() => String(route.params.id))
const isHost = computed(() => Boolean(table.value && session.user?.id === table.value.host?.id))
const hasConfirmedParticipation = computed(() => myParticipation.value?.status === 'confirmed')

async function load() {
  isLoading.value = true
  error.value = ''
  privateLocation.value = null
  table.value = null
  participations.value = []
  myParticipation.value = discovery.myParticipations[tableId.value] ?? null
  try {
    table.value = await getTable(tableId.value)
    if (isHost.value && session.accessToken) {
      try {
        participations.value = (await listParticipations(tableId.value, session.accessToken)).items
        offerSeats.value = Object.fromEntries(participations.value.map((item) => [item.id, Math.min(item.requestedSeats, table.value?.availableSeats ?? 1)]))
      } catch (cause) {
        error.value = errorMessage(cause)
      }
    }
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isLoading.value = false
  }
}

async function requestSeats() {
  if (!session.accessToken) {
    await router.push({ name: 'sign-in', query: { redirect: route.fullPath } })
    return
  }
  isActing.value = true
  error.value = ''
  notice.value = ''
  try {
    const participation = await requestParticipation(tableId.value, Number(requestedSeats.value), session.accessToken)
    myParticipation.value = participation
    discovery.rememberParticipation(participation)
    notice.value = participation.status === 'confirmed' ? 'Tu grupo quedó confirmado.' : 'Tu solicitud se envió al anfitrión.'
    await load()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

async function resolveParticipation(participation: TableParticipation, seats?: number) {
  if (!session.accessToken) return
  isActing.value = true
  error.value = ''
  notice.value = ''
  try {
    if (seats === undefined) await rejectParticipation(tableId.value, participation.id, session.accessToken)
    else await offerParticipation(tableId.value, participation.id, Number(seats), session.accessToken)
    notice.value = seats !== undefined && seats < participation.requestedSeats ? 'Oferta parcial enviada; la persona debe aceptarla y habrá una nueva comprobación de cupo.' : 'Solicitud resuelta.'
    await load()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

async function acceptOffer() {
  if (!session.accessToken || !myParticipation.value) return
  isActing.value = true
  error.value = ''
  try {
    myParticipation.value = await acceptParticipationOffer(tableId.value, myParticipation.value.id, session.accessToken)
    discovery.rememberParticipation(myParticipation.value)
    notice.value = 'Tu participación quedó confirmada.'
    await load()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

async function cancelMyParticipation() {
  if (!session.accessToken || !myParticipation.value) return
  if (!window.confirm('¿Quieres cancelar tu participación?')) return
  isActing.value = true
  error.value = ''
  try {
    await cancelParticipation(tableId.value, myParticipation.value.id, session.accessToken)
    discovery.forgetParticipation(tableId.value)
    myParticipation.value = null
    privateLocation.value = null
    notice.value = 'Participación cancelada.'
    await load()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

async function cancelThisTable() {
  if (!session.accessToken || !window.confirm('¿Quieres cancelar esta mesa? Se cancelarán también las solicitudes y confirmaciones vigentes.')) return
  isActing.value = true
  error.value = ''
  try {
    await cancelTable(tableId.value, session.accessToken)
    notice.value = 'Mesa cancelada.'
    if (table.value) table.value = { ...table.value, status: 'cancelled' }
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

function startEdit() {
  if (!table.value) return
  editTitle.value = table.value.title
  editDescription.value = table.value.description
  editCity.value = table.value.city
  editOfferedSeats.value = table.value.offeredSeats
  editFeeMxn.value = table.value.feeMxn
  editAccessMode.value = table.value.accessMode
  isEditing.value = true
}

async function saveTableChanges() {
  if (!session.accessToken) return
  isActing.value = true
  error.value = ''
  try {
    table.value = await updateTable(tableId.value, {
      title: editTitle.value.trim(), description: editDescription.value.trim(), city: editCity.value.trim(),
      offeredSeats: Number(editOfferedSeats.value), feeMxn: editFeeMxn.value.trim(), accessMode: editAccessMode.value,
    }, session.accessToken)
    isEditing.value = false
    notice.value = 'Mesa actualizada.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isActing.value = false
  }
}

async function loadPrivateLocation() {
  if (!session.accessToken) return
  error.value = ''
  try {
    privateLocation.value = await getPrivateTableLocation(tableId.value, session.accessToken)
  } catch (cause) {
    privateLocation.value = null
    error.value = errorMessage(cause)
  }
}

function dateLabel(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short', timeZone }).format(new Date(value))
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { pending: 'Pendiente', partial_offered: 'Oferta parcial', confirmed: 'Confirmada', rejected: 'Rechazada', cancelled: 'Cancelada', expired: 'Vencida' }
  return labels[status] ?? status
}

watch(tableId, () => void load(), { immediate: true })
watch(() => [session.accessToken, session.user?.id, myParticipation.value?.status], () => {
  if (!session.accessToken || (!isHost.value && !hasConfirmedParticipation.value)) privateLocation.value = null
})
onIonViewWillLeave(() => { privateLocation.value = null })
</script>

<template>
  <IonPage>
    <WorkspacePage title="Detalle de mesa" eyebrow="Encuentro" :heading="table?.title || 'Detalle de mesa'" description="Consulta las condiciones del encuentro y administra tu participación.">
      <p v-if="isLoading" class="form-message" role="status">Cargando mesa…</p>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <template v-if="table">
        <IonCard class="data-card detail-card">
          <IonCardHeader>
            <IonCardTitle>{{ table.title }}</IonCardTitle>
            <p class="card-subtitle">{{ table.city }} · {{ dateLabel(table.startsAt, table.timeZone) }}</p>
          </IonCardHeader>
          <IonCardContent>
            <p>{{ table.description }}</p>
            <p>Anfitrión: <RouterLink v-if="table.host" :to="{ name: 'public-profile', params: { id: table.host.id } }">{{ table.host?.displayName }}</RouterLink></p>
            <p>{{ table.initialGroupSize }} personas en el grupo inicial · {{ table.availableSeats }} de {{ table.offeredSeats }} lugares adicionales disponibles</p>
            <p>{{ table.feeMxn === '0.00' ? 'Sin cuota' : `$${table.feeMxn} MXN por persona` }} · {{ table.accessMode === 'open' ? 'Acceso abierto' : 'Requiere aprobación' }}</p>
            <p v-if="table.games.length">Juegos: {{ table.games.map((game) => game.name).join(' · ') }}</p>
            <p v-if="table.amenities.length">Amenidades: {{ table.amenities.join(' · ') }}</p>
            <p v-if="table.locationVisibility === 'confirmed-only'">La dirección es privada. La ubicación aproximada no identifica el punto de encuentro.</p>
            <p v-else>Dirección: {{ table.addressLine || 'Consulta con el anfitrión.' }}</p>
            <p v-if="table.status !== 'published'" class="form-message">Estado de la mesa: {{ table.status }}</p>
          </IonCardContent>
        </IonCard>

        <IonCard v-if="table.status === 'published' && !isHost && !myParticipation" class="data-card">
          <IonCardHeader><IonCardTitle>Solicitar lugares</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <form class="inline-form" @submit.prevent="requestSeats">
              <IonInput v-model="requestedSeats" type="number" label="Lugares para tu grupo" label-placement="stacked" fill="outline" min="1" max="100" required />
              <IonButton type="submit" :disabled="isActing || table.availableSeats < 1 || Boolean(session.user && !session.user.emailVerified)">{{ isActing ? 'Enviando…' : (table.accessMode === 'open' ? 'Confirmar asistencia' : 'Pedir aprobación') }}</IonButton>
            </form>
            <p v-if="!session.isAuthenticated">Al continuar se te pedirá iniciar sesión.</p>
            <p v-else-if="!session.user?.emailVerified" class="field-hint">Verifica tu correo para solicitar lugares.</p>
          </IonCardContent>
        </IonCard>

        <IonCard v-if="isHost && table.status === 'published'" class="data-card">
          <IonCardHeader><IonCardTitle>Administrar publicación</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonButton v-if="!isEditing" fill="outline" @click="startEdit">Editar mesa</IonButton>
            <form v-else class="api-form" @submit.prevent="saveTableChanges">
              <IonInput v-model="editTitle" label="Título" label-placement="stacked" fill="outline" required />
              <IonTextarea v-model="editDescription" label="Descripción" label-placement="stacked" fill="outline" :auto-grow="true" required />
              <IonInput v-model="editCity" label="Ciudad" label-placement="stacked" fill="outline" required />
              <IonInput v-model="editOfferedSeats" type="number" label="Lugares adicionales" label-placement="stacked" fill="outline" min="0" max="1000" required />
              <IonInput v-model="editFeeMxn" label="Cuota por persona (MXN)" label-placement="stacked" fill="outline" />
              <IonSelect v-model="editAccessMode" label="Acceso" label-placement="stacked" fill="outline">
                <IonSelectOption value="open">Abierto</IonSelectOption>
                <IonSelectOption value="approval">Con aprobación</IonSelectOption>
              </IonSelect>
              <div class="inline-form">
                <IonButton type="submit" :disabled="isActing">{{ isActing ? 'Guardando…' : 'Guardar cambios' }}</IonButton>
                <IonButton type="button" fill="clear" @click="isEditing = false">Cancelar edición</IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>

        <IonCard v-if="myParticipation" class="data-card">
          <IonCardHeader><IonCardTitle>Tu participación: {{ statusLabel(myParticipation.status) }}</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <p v-if="myParticipation.status === 'confirmed'">{{ myParticipation.confirmedSeats }} lugares confirmados.</p>
            <p v-else-if="myParticipation.status === 'partial_offered'">El anfitrión ofrece {{ myParticipation.offeredSeats }} lugares para una solicitud de {{ myParticipation.requestedSeats }}.</p>
            <p v-else>Solicitaste {{ myParticipation.requestedSeats }} lugares.</p>
            <IonButton v-if="myParticipation.status === 'partial_offered'" :disabled="isActing" @click="acceptOffer">Aceptar oferta</IonButton>
            <IonButton v-if="['pending', 'partial_offered', 'confirmed'].includes(myParticipation.status)" fill="outline" color="danger" :disabled="isActing" @click="cancelMyParticipation">Cancelar participación</IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard v-if="table.locationVisibility === 'confirmed-only' && (isHost || hasConfirmedParticipation)" class="data-card">
          <IonCardHeader><IonCardTitle>Dirección del encuentro</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonButton v-if="!privateLocation" fill="outline" @click="loadPrivateLocation">Consultar ubicación privada</IonButton>
            <div v-if="privateLocation" class="private-location">
              <p>{{ privateLocation.addressLine }}</p>
              <p v-if="privateLocation.instructions">{{ privateLocation.instructions }}</p>
              <p v-if="privateLocation.latitude !== null && privateLocation.longitude !== null">{{ privateLocation.latitude }}, {{ privateLocation.longitude }}</p>
            </div>
          </IonCardContent>
        </IonCard>

        <section v-if="isHost" class="content-section">
          <h2>Solicitudes de asistencia</h2>
          <p v-if="!participations.length" class="field-hint">No hay solicitudes registradas.</p>
          <IonCard v-for="participation in participations" :key="participation.id" class="data-card">
            <IonCardHeader><IonCardTitle>{{ participation.user?.displayName || 'Participante' }} · {{ statusLabel(participation.status) }}</IonCardTitle></IonCardHeader>
            <IonCardContent>
              <p>Solicitó {{ participation.requestedSeats }} lugares<span v-if="participation.confirmedSeats"> · Confirmados: {{ participation.confirmedSeats }}</span></p>
              <div v-if="participation.status === 'pending'" class="inline-form">
                <IonInput v-model="offerSeats[participation.id]" type="number" label="Lugares a ofrecer" label-placement="stacked" fill="outline" min="1" :max="participation.requestedSeats" />
                <IonButton :disabled="isActing" @click="resolveParticipation(participation, offerSeats[participation.id])">Aprobar / ofrecer</IonButton>
                <IonButton fill="clear" color="danger" :disabled="isActing" @click="resolveParticipation(participation)">Rechazar</IonButton>
              </div>
              <IonButton v-else-if="participation.status === 'partial_offered'" fill="clear" color="danger" :disabled="isActing" @click="resolveParticipation(participation)">Retirar oferta</IonButton>
            </IonCardContent>
          </IonCard>
          <IonButton v-if="table.status === 'published'" fill="outline" color="danger" :disabled="isActing" @click="cancelThisTable">Cancelar mesa</IonButton>
        </section>
      </template>
    </WorkspacePage>
  </IonPage>
</template>
