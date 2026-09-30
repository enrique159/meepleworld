import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'user_sessions' })
@Index('uq_user_sessions_refresh_hash', ['refreshTokenHash'], { unique: true })
@Index('idx_user_sessions_user_expiry', ['userId', 'expiresAt'])
export class UserSessionEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId!: string

  @Column({ type: 'char', length: 64, name: 'refresh_token_hash', select: false })
  refreshTokenHash!: string

  @Column({ type: 'datetime', precision: 3, name: 'expires_at' })
  expiresAt!: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date
}
