import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm'

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
@Index('idx_users_status', ['status'])
export class UserEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string

  @Column({ type: 'varchar', length: 120, name: 'display_name' })
  displayName!: string

  @Column({ type: 'varchar', length: 254 })
  email!: string

  @Column({ type: 'varchar', length: 255, name: 'password_hash', select: false })
  passwordHash!: string

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'avatar_url' })
  avatarUrl!: string | null

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'email_verified_at' })
  emailVerifiedAt!: Date | null

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole

  @CreateDateColumn({ type: 'datetime', precision: 3, name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, name: 'updated_at' })
  updatedAt!: Date
}
