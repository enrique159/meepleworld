import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'games' })
@Index('uq_games_bgg_id', ['bggId'], { unique: true })
export class GameEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'varchar', length: 180 })
  name!: string

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'image_url' })
  imageUrl!: string | null

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'min_players' })
  minPlayers!: number | null

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'max_players' })
  maxPlayers!: number | null

  @Column({ type: 'smallint', unsigned: true, nullable: true, name: 'playing_time_minutes' })
  playingTimeMinutes!: number | null

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'bgg_id' })
  bggId!: number | null

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, name: 'updated_at' })
  updatedAt!: Date
}

export enum LibraryEntrySource {
  MANUAL = 'manual',
  BGG = 'bgg',
}

@Entity({ name: 'library_entries' })
@Index('uq_library_entries_user_game', ['userId', 'gameId'], { unique: true })
@Index('idx_library_entries_game', ['gameId'])
export class LibraryEntryEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId!: string

  @Column({ type: 'char', length: 36, name: 'game_id' })
  gameId!: string

  @Column({ type: 'enum', enum: LibraryEntrySource, default: LibraryEntrySource.MANUAL })
  source!: LibraryEntrySource

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'bgg_user_name' })
  bggUserName!: string | null

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'added_at' })
  addedAt!: Date
}
