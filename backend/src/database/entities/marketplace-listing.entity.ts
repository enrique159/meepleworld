import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm'

export enum ListingKind {
  SALE = 'sale',
  WANTED = 'wanted',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REMOVED = 'removed',
}

export enum GameCondition {
  NEW = 'new',
  LIKE_NEW = 'like-new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity({ name: 'marketplace_listings' })
@Index('idx_marketplace_status_kind_created', ['status', 'kind', 'createdAt'])
@Index('idx_marketplace_city_created', ['city', 'createdAt'])
@Index('idx_marketplace_author_status', ['authorUserId', 'status'])
export class MarketplaceListingEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'author_user_id' })
  authorUserId!: string

  @Column({ type: 'char', length: 36, name: 'game_id' })
  gameId!: string

  @Column({ type: 'enum', enum: ListingKind })
  kind!: ListingKind

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'varchar', length: 120 })
  city!: string

  @Column({ type: 'enum', enum: GameCondition, nullable: true, name: 'game_condition' })
  condition!: GameCondition | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'price_mxn' })
  priceMxn!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'budget_mxn' })
  budgetMxn!: string | null

  @Column({ type: 'json', name: 'image_urls' })
  imageUrls!: string[]

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE })
  status!: ListingStatus

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, name: 'updated_at' })
  updatedAt!: Date
}
