export interface GameSummary {
  id: string
  name: string
  imageUrl?: string
  minPlayers?: number
  maxPlayers?: number
  playingTimeMinutes?: number
  bggId?: number
}

export interface TableSummary {
  id: string
  title: string
  city: string
  startsAt: string
  timeZone: string
  availableSeats: number
  feeMxn: string
  locationVisibility: 'public' | 'confirmed-only'
}

export interface MarketplaceListingSummary {
  id: string
  kind: 'sale' | 'wanted'
  gameName: string
  city: string
  priceMxn?: string
  condition?: string
}
