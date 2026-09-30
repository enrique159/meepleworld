import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'email_verification_tokens' })
@Index('uq_email_verification_hash', ['tokenHash'], { unique: true })
@Index('idx_email_verification_user_expiry', ['userId', 'expiresAt'])
export class EmailVerificationTokenEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId!: string

  @Column({ type: 'char', length: 64, name: 'token_hash', select: false })
  tokenHash!: string

  @Column({ type: 'datetime', precision: 3, name: 'expires_at' })
  expiresAt!: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'consumed_at' })
  consumedAt!: Date | null

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date
}

@Entity({ name: 'password_reset_tokens' })
@Index('uq_password_reset_hash', ['tokenHash'], { unique: true })
@Index('idx_password_reset_user_expiry', ['userId', 'expiresAt'])
export class PasswordResetTokenEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId!: string

  @Column({ type: 'char', length: 64, name: 'token_hash', select: false })
  tokenHash!: string

  @Column({ type: 'datetime', precision: 3, name: 'expires_at' })
  expiresAt!: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'consumed_at' })
  consumedAt!: Date | null

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date
}
