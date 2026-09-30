export interface ApiPage<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface AuthUser {
  id: string
  displayName: string
  email: string
  emailVerified: boolean
  city: string | null
  avatarUrl: string | null
}

export interface PublicProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  city: string | null
  memberSince: string
}

export interface GameSummary {
  id: string
  name: string
  imageUrl?: string
  minPlayers?: number
  maxPlayers?: number
  playingTimeMinutes?: number
  bggId?: number
}

export interface LibraryEntry extends GameSummary {
  source: 'manual' | 'bgg'
  addedAt: string
}

export type TableAccessMode = 'open' | 'approval'
export type LocationVisibility = 'public' | 'confirmed-only'
export type TableStatus = 'published' | 'in_progress' | 'finished' | 'cancelled' | 'removed'
export type ParticipationStatus = 'pending' | 'partial_offered' | 'confirmed' | 'rejected' | 'cancelled' | 'withdrawn' | 'expired'

export interface TableSummary {
  id: string
  title: string
  description: string
  city: string
  startsAt: string
  timeZone: string
  durationMinutes: number | null
  initialGroupSize: number
  offeredSeats: number
  availableSeats: number
  accessMode: TableAccessMode
  locationVisibility: LocationVisibility
  latitude: number | null
  longitude: number | null
  locationApproximate: boolean
  addressLine?: string | null
  feeMxn: string
  amenities: string[]
  status: TableStatus
  host?: { id: string; displayName: string; avatarUrl: string | null }
  games: Array<{ id: string; name: string; imageUrl: string | null }>
}

export interface TableParticipation {
  id: string
  tableId: string
  requestedSeats: number
  offeredSeats: number | null
  confirmedSeats: number | null
  status: ParticipationStatus
  createdAt: string
  user?: { id: string; displayName: string; avatarUrl: string | null } | null
}

export interface PrivateTableLocation {
  tableId: string
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  instructions: string | null
}

export type ListingKind = 'sale' | 'wanted'
export type ListingStatus = 'active' | 'sold' | 'resolved' | 'closed'
export type GameCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'

export interface MarketplaceListing {
  id: string
  kind: ListingKind
  gameId: string
  gameName: string
  imageUrl: string | null
  city: string
  description: string
  condition: GameCondition | null
  priceMxn: string | null
  budgetMxn: string | null
  imageUrls: string[]
  status: ListingStatus
  createdAt: string
  author: { id: string; displayName: string; avatarUrl: string | null; city: string | null }
}

export interface CreateTableInput {
  title: string
  description: string
  city: string
  startsAt: string
  timeZone: string
  durationMinutes?: number | null
  initialGroupSize: number
  offeredSeats: number
  accessMode: TableAccessMode
  locationVisibility: LocationVisibility
  addressLine?: string | null
  latitude: number
  longitude: number
  feeMxn?: string
  amenities: string[]
  instructions?: string | null
  gameIds: string[]
}

export interface CreateListingInput {
  gameId: string
  kind: ListingKind
  description: string
  city: string
  condition?: GameCondition | null
  priceMxn?: string | null
  budgetMxn?: string | null
  imageUrls?: string[]
}
