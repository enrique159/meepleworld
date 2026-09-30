<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonLabel, IonPage, IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonTextarea } from '@ionic/vue'
import WorkspacePage from '@/shared/components/WorkspacePage.vue'
import { useMarketplaceStore, type MarketplaceKind } from '@/features/marketplace/stores/marketplace.store'
import { useSessionStore } from '@/features/account/stores/session.store'
import { closeListing, createListing, listListings, updateListing } from '@/services/api/marketplace.api'
import { listGames } from '@/services/api/games.api'
import { errorMessage } from '@/services/api/errors'
import type { GameCondition, GameSummary, ListingKind, MarketplaceListing } from '@/services/api/api.types'

const marketplace = useMarketplaceStore()
const session = useSessionStore()
const listings = ref<MarketplaceListing[]>([])
const catalog = ref<GameSummary[]>([])
const gameQuery = ref('')
const formOpen = ref(false)
const editing = ref<MarketplaceListing | null>(null)
const gameId = ref('')
const kind = ref<ListingKind>('sale')
const description = ref('')
const city = ref('')
const condition = ref<GameCondition>('good')
const priceMxn = ref('')
const budgetMxn = ref('')
const imageUrls = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const notice = ref('')
const verified = computed(() => Boolean(session.user?.emailVerified))
const canEdit = computed(() => Boolean(editing.value && editing.value.author.id === session.user?.id))

async function loadListings() {
  isLoading.value = true
  error.value = ''
  try {
    const result = await listListings({
      kind: marketplace.kind === 'all' ? undefined : marketplace.kind,
      city: marketplace.city.trim() || undefined,
      q: marketplace.query.trim() || undefined,
    })
    listings.value = result.items
  } catch (cause) {
    error.value = errorMessage(cause)
    listings.value = []
  } finally {
    isLoading.value = false
  }
}

async function searchCatalog() {
  error.value = ''
  try {
    catalog.value = (await listGames({ q: gameQuery.value.trim() || undefined, pageSize: 100 })).items
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

function openCreate() {
  editing.value = null
  gameId.value = ''
  kind.value = 'sale'
  description.value = ''
  city.value = session.user?.city ?? marketplace.city
  condition.value = 'good'
  priceMxn.value = ''
  budgetMxn.value = ''
  imageUrls.value = ''
  formOpen.value = true
  void searchCatalog()
}

function openEdit(listing: MarketplaceListing) {
  editing.value = listing
  gameId.value = listing.gameId
  kind.value = listing.kind
  description.value = listing.description
  city.value = listing.city
  condition.value = listing.condition ?? 'good'
  priceMxn.value = listing.priceMxn ?? ''
  budgetMxn.value = listing.budgetMxn ?? ''
  imageUrls.value = listing.imageUrls.join(', ')
  formOpen.value = true
}

async function saveListing() {
  if (!session.accessToken) return
  error.value = ''
  notice.value = ''
  isSaving.value = true
  const urls = imageUrls.value.split(',').map((url) => url.trim()).filter(Boolean)
  try {
    if (editing.value) {
      const updated = await updateListing(editing.value.id, {
        description: description.value.trim(), city: city.value.trim(), condition: condition.value,
        priceMxn: kind.value === 'sale' ? priceMxn.value.trim() : null,
        budgetMxn: kind.value === 'wanted' ? (budgetMxn.value.trim() || null) : null,
        imageUrls: urls,
      }, session.accessToken)
      listings.value = listings.value.map((item) => item.id === updated.id ? updated : item)
      notice.value = 'Anuncio actualizado.'
    } else {
      const created = await createListing({
        gameId: gameId.value, kind: kind.value, description: description.value.trim(), city: city.value.trim(), condition: condition.value,
        priceMxn: kind.value === 'sale' ? priceMxn.value.trim() : null,
        budgetMxn: kind.value === 'wanted' ? (budgetMxn.value.trim() || null) : null,
        imageUrls: urls,
      }, session.accessToken)
      notice.value = 'Anuncio publicado.'
      formOpen.value = false
      if (marketplace.kind === 'all' || marketplace.kind === created.kind) listings.value = [created, ...listings.value]
    }
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    isSaving.value = false
  }
}

async function close(listing: MarketplaceListing, outcome: 'sold' | 'resolved' | 'closed') {
  if (!session.accessToken) return
  const verb = outcome === 'sold' ? 'marcar como vendido' : outcome === 'resolved' ? 'marcar como resuelto' : 'cerrar'
  if (!window.confirm(`¿Quieres ${verb} este anuncio?`)) return
  error.value = ''
  try {
    await closeListing(listing.id, outcome, session.accessToken)
    listings.value = listings.value.filter((item) => item.id !== listing.id)
    notice.value = 'Anuncio actualizado.'
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

function setKind(value: string | number | undefined) {
  if (value === 'all' || value === 'sale' || value === 'wanted') {
    marketplace.kind = value satisfies MarketplaceKind
  }
}

function conditionLabel(value: GameCondition | null) {
  const labels: Record<GameCondition, string> = { new: 'Nuevo', 'like-new': 'Como nuevo', good: 'Bueno', fair: 'Aceptable', poor: 'Desgastado' }
  return value ? labels[value] : ''
}

onIonViewWillEnter(() => void loadListings())
</script>

<template>
  <IonPage>
    <WorkspacePage
      title="Marketplace"
      eyebrow="Juegos que cambian de mesa"
      heading="Compra, vende o encuentra un juego"
      description="Explora anuncios activos. El chat aún no está implementado, así que las conversaciones se habilitarán cuando exista ese endpoint."
    >
      <form class="discovery-controls" aria-label="Filtros del marketplace" @submit.prevent="loadListings">
        <IonInput
          v-model="marketplace.city"
          label="Ciudad"
          label-placement="stacked"
          placeholder="Cualquier ciudad"
          fill="outline"
          autocomplete="address-level2"
        />
        <IonInput v-model="marketplace.query" label="Juego" label-placement="stacked" placeholder="Buscar por nombre" fill="outline" />
        <IonSegment :value="marketplace.kind" aria-label="Tipo de anuncio" @ion-change="setKind($event.detail.value)">
          <IonSegmentButton value="all"><IonLabel>Todos</IonLabel></IonSegmentButton>
          <IonSegmentButton value="sale"><IonLabel>En venta</IonLabel></IonSegmentButton>
          <IonSegmentButton value="wanted"><IonLabel>Busco</IonLabel></IonSegmentButton>
        </IonSegment>
        <IonButton type="submit" :disabled="isLoading">{{ isLoading ? 'Buscando…' : 'Buscar anuncios' }}</IonButton>
      </form>
      <p v-if="!verified" class="field-hint">Verifica tu correo para publicar y administrar anuncios.</p>
      <p v-if="error" class="form-message form-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="form-message form-success" role="status">{{ notice }}</p>
      <IonButton expand="block" :disabled="!verified" @click="openCreate">Publicar anuncio</IonButton>

      <form v-if="formOpen" class="api-form form-panel" @submit.prevent="saveListing">
        <h2>{{ editing ? 'Editar anuncio' : 'Nuevo anuncio' }}</h2>
        <template v-if="!editing">
          <IonSelect v-model="kind" label="Tipo de anuncio" label-placement="stacked" fill="outline">
            <IonSelectOption value="sale">En venta</IonSelectOption>
            <IonSelectOption value="wanted">Busco este juego</IonSelectOption>
          </IonSelect>
          <div class="inline-form">
            <IonInput v-model="gameQuery" label="Buscar juego del catálogo" label-placement="stacked" fill="outline" />
            <IonButton type="button" fill="outline" @click="searchCatalog">Buscar juegos</IonButton>
          </div>
          <IonSelect v-model="gameId" label="Juego" label-placement="stacked" fill="outline" required>
            <IonSelectOption v-for="game in catalog" :key="game.id" :value="game.id">{{ game.name }}</IonSelectOption>
          </IonSelect>
        </template>
        <IonInput v-model="city" label="Ciudad" label-placement="stacked" fill="outline" :maxlength="120" required />
        <IonTextarea v-model="description" label="Descripción" label-placement="stacked" fill="outline" :maxlength="5000" :auto-grow="true" required />
        <IonSelect v-model="condition" label="Condición" label-placement="stacked" fill="outline">
          <IonSelectOption value="new">Nuevo</IonSelectOption>
          <IonSelectOption value="like-new">Como nuevo</IonSelectOption>
          <IonSelectOption value="good">Bueno</IonSelectOption>
          <IonSelectOption value="fair">Aceptable</IonSelectOption>
          <IonSelectOption value="poor">Desgastado</IonSelectOption>
        </IonSelect>
        <IonInput v-if="kind === 'sale'" v-model="priceMxn" label="Precio (MXN)" label-placement="stacked" fill="outline" inputmode="decimal" placeholder="500.00" required />
        <IonInput v-else v-model="budgetMxn" label="Presupuesto opcional (MXN)" label-placement="stacked" fill="outline" inputmode="decimal" />
        <IonInput v-model="imageUrls" label="URLs de imágenes separadas por comas" label-placement="stacked" fill="outline" />
        <div class="inline-form">
          <IonButton type="submit" :disabled="isSaving || !city || !description || (!editing && !gameId) || (kind === 'sale' && !priceMxn)">{{ isSaving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Publicar') }}</IonButton>
          <IonButton type="button" fill="clear" @click="formOpen = false">Cancelar</IonButton>
        </div>
      </form>

      <p v-if="isLoading" class="field-hint" role="status">Cargando anuncios…</p>
      <p v-else-if="!listings.length" class="field-hint">No hay anuncios activos que coincidan con la búsqueda.</p>
      <div v-if="listings.length" class="item-grid">
        <IonCard v-for="listing in listings" :key="listing.id" class="data-card">
          <IonCardHeader>
            <IonCardTitle>{{ listing.gameName }}</IonCardTitle>
            <p class="card-subtitle">{{ listing.kind === 'sale' ? 'En venta' : 'Lo busca' }} · {{ listing.city }}</p>
          </IonCardHeader>
          <IonCardContent>
            <p>{{ listing.description }}</p>
            <p v-if="listing.kind === 'sale'">{{ conditionLabel(listing.condition) }} · ${{ listing.priceMxn }} MXN</p>
            <p v-else>Presupuesto: {{ listing.budgetMxn ? `$${listing.budgetMxn} MXN` : 'sin especificar' }}<span v-if="listing.condition"> · condición aceptable: {{ conditionLabel(listing.condition) }}</span></p>
            <p>Publicado por <RouterLink :to="{ name: 'public-profile', params: { id: listing.author.id } }">{{ listing.author.displayName }}</RouterLink></p>
            <p class="field-hint">El chat asociado al anuncio aún no está disponible.</p>
            <div v-if="listing.author.id === session.user?.id" class="inline-form">
              <IonButton fill="outline" @click="openEdit(listing)">Editar</IonButton>
              <IonButton v-if="listing.kind === 'sale'" fill="clear" @click="close(listing, 'sold')">Marcar vendido</IonButton>
              <IonButton v-else fill="clear" @click="close(listing, 'resolved')">Marcar resuelto</IonButton>
              <IonButton fill="clear" color="danger" @click="close(listing, 'closed')">Cerrar</IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </WorkspacePage>
  </IonPage>
</template>
