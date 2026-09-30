<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonPage } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useLibraryStore } from '@/features/library/stores/library.store'
import { useSessionStore } from '@/features/account/stores/session.store'
import { addLibraryGame, createGame, getLibrary, listGames, removeLibraryGame } from '@/services/api/games.api'
import { errorMessage } from '@/services/api/errors'
import type { GameSummary, LibraryEntry } from '@/services/api/api.types'

const library = useLibraryStore()
const session = useSessionStore()
const entries = ref<LibraryEntry[]>([])
const results = ref<GameSummary[]>([])
const query = ref('')
const newGameName = ref('')
const isLoading = ref(false)
const isSearching = ref(false)
const error = ref('')
const notice = ref('')
const verified = computed(() => Boolean(session.user?.emailVerified))

async function loadLibrary() {
  if (!session.accessToken) return
  isLoading.value = true
  error.value = ''
  try {
    entries.value = (await getLibrary(session.accessToken)).items
    library.replaceGames(entries.value)
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isLoading.value = false
  }
}

async function searchCatalog() {
  isSearching.value = true
  error.value = ''
  try {
    results.value = (await listGames({ q: query.value.trim() || undefined, pageSize: 30 })).items
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSearching.value = false
  }
}

async function addGame(game: GameSummary) {
  if (!session.accessToken) return
  error.value = ''
  notice.value = ''
  try {
    await addLibraryGame(game.id, session.accessToken)
    await loadLibrary()
    notice.value = `${game.name} se agregó a tu biblioteca.`
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

async function createManualGame() {
  if (!session.accessToken) return
  error.value = ''
  notice.value = ''
  try {
    const game = await createGame({ name: newGameName.value.trim() }, session.accessToken)
    await addLibraryGame(game.id, session.accessToken)
    newGameName.value = ''
    await Promise.all([loadLibrary(), searchCatalog()])
    notice.value = `${game.name} se creó y agregó a tu biblioteca.`
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

async function removeGame(game: LibraryEntry) {
  if (!session.accessToken) return
  error.value = ''
  try {
    await removeLibraryGame(game.id, session.accessToken)
    entries.value = entries.value.filter((entry) => entry.id !== game.id)
    library.replaceGames(entries.value)
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

function isInLibrary(gameId: string) {
  return entries.value.some((entry) => entry.id === gameId)
}

onIonViewWillEnter(() => void loadLibrary())
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Mi biblioteca"
      eyebrow="Tu colección"
      heading="Tus juegos, listos para la próxima partida"
      description="Consulta el catálogo, agrega juegos y elige cuáles proponer al organizar una mesa."
    >
      <p v-if="!verified" class="form-message form-error" role="status">Verifica tu correo para agregar juegos.</p>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <section class="content-section">
        <h2>Mi colección <span class="result-count">{{ entries.length }}</span></h2>
        <p v-if="isLoading" class="field-hint">Cargando biblioteca…</p>
        <div v-else-if="entries.length" class="item-grid">
          <IonCard v-for="game in entries" :key="game.id" class="data-card">
            <IonCardHeader><IonCardTitle>{{ game.name }}</IonCardTitle></IonCardHeader>
            <IonCardContent>
              <p v-if="game.minPlayers || game.maxPlayers">{{ game.minPlayers || '—' }}–{{ game.maxPlayers || '—' }} jugadores</p>
              <p v-if="game.playingTimeMinutes">{{ game.playingTimeMinutes }} minutos</p>
              <IonButton fill="clear" color="danger" @click="removeGame(game)">Quitar</IonButton>
            </IonCardContent>
          </IonCard>
        </div>
        <p v-else class="field-hint">Aún no tienes juegos guardados.</p>
      </section>

      <section class="content-section form-panel">
        <h2>Buscar en el catálogo</h2>
        <form class="inline-form" @submit.prevent="searchCatalog">
          <IonInput v-model="query" label="Nombre del juego" label-placement="stacked" fill="outline" placeholder="Ej. Catan" />
          <IonButton type="submit" :disabled="isSearching">{{ isSearching ? 'Buscando…' : 'Buscar' }}</IonButton>
        </form>
        <div v-if="results.length" class="item-grid">
          <IonCard v-for="game in results" :key="game.id" class="data-card">
            <IonCardHeader><IonCardTitle>{{ game.name }}</IonCardTitle></IonCardHeader>
            <IonCardContent>
              <p v-if="game.minPlayers || game.maxPlayers">{{ game.minPlayers || '—' }}–{{ game.maxPlayers || '—' }} jugadores</p>
              <IonButton v-if="!isInLibrary(game.id)" :disabled="!verified" @click="addGame(game)">Agregar</IonButton>
              <span v-else class="field-hint">Ya está en tu biblioteca</span>
            </IonCardContent>
          </IonCard>
        </div>
      </section>

      <section class="content-section form-panel">
        <h2>Registrar juego manualmente</h2>
        <form class="inline-form" @submit.prevent="createManualGame">
          <IonInput v-model="newGameName" label="Nombre del juego" label-placement="stacked" fill="outline" :maxlength="180" required />
          <IonButton type="submit" :disabled="!verified || !newGameName.trim()">Crear y agregar</IonButton>
        </form>
      </section>
      <p class="field-hint">La importación de BoardGameGeek aún no tiene endpoint.</p>
    </WorkspacePage>
  </IonPage>
</template>
