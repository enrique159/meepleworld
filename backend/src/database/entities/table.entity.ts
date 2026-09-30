import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm'

export enum TableStatus {
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  REMOVED = 'removed',
}

export enum TableAccessMode {
  OPEN = 'open',
  APPROVAL = 'approval',
}

export enum LocationVisibility {
  PUBLIC = 'public',
  CONFIRMED_ONLY = 'confirmed-only',
}

@Entity({ name: 'game_tables' })
@Index('idx_game_tables_city_start', ['city', 'startsAt'])
@Index('idx_game_tables_status_start', ['status', 'startsAt'])
@Index('idx_game_tables_host', ['hostUserId', 'status'])
export class TableEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'host_user_id' })
  hostUserId!: string

  @Column({ type: 'varchar', length: 160 })
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'varchar', length: 120 })
  city!: string

  @Column({ type: 'datetime', precision: 3, name: 'starts_at' })
  startsAt!: Date

  @Column({ type: 'varchar', length: 64, name: 'time_zone' })
  timeZone!: string

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'duration_minutes' })
  durationMinutes!: number | null

  @Column({ type: 'smallint', unsigned: true, name: 'initial_group_size' })
  initialGroupSize!: number

  @Column({ type: 'smallint', unsigned: true, name: 'offered_seats' })
  offeredSeats!: number

  @Column({ type: 'enum', enum: TableAccessMode, name: 'access_mode' })
  accessMode!: TableAccessMode

  @Column({ type: 'enum', enum: LocationVisibility, name: 'location_visibility' })
  locationVisibility!: LocationVisibility

  @Column({ type: 'varchar', length: 240, nullable: true, name: 'address_line' })
  addressLine!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'public_latitude' })
  publicLatitude!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'public_longitude' })
  publicLongitude!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00', name: 'fee_mxn' })
  feeMxn!: string

  @Column({ type: 'json' })
  amenities!: string[]

  @Column({ type: 'text', nullable: true })
  instructions!: string | null

  @Column({ type: 'enum', enum: TableStatus, default: TableStatus.PUBLISHED })
  status!: TableStatus

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'table_games' })
@Index('idx_table_games_game', ['gameId'])
export class TableGameEntity {
  @PrimaryColumn('char', { length: 36, name: 'table_id' })
  tableId!: string

  @PrimaryColumn('char', { length: 36, name: 'game_id' })
  gameId!: string
}

export enum ParticipationStatus {
  PENDING = 'pending',
  PARTIAL_OFFERED = 'partial_offered',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

@Entity({ name: 'table_participations' })
@Index('idx_table_participations_table_status', ['tableId', 'status'])
@Index('idx_table_participations_user_status', ['userId', 'status'])
export class TableParticipationEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'table_id' })
  tableId!: string

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId!: string

  @Column({ type: 'smallint', unsigned: true, name: 'requested_seats' })
  requestedSeats!: number

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'offered_seats' })
  offeredSeats!: number | null

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'confirmed_seats' })
  confirmedSeats!: number | null

  @Column({ type: 'enum', enum: ParticipationStatus, default: ParticipationStatus.PENDING })
  status!: ParticipationStatus

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, name: 'updated_at' })
  updatedAt!: Date
}
