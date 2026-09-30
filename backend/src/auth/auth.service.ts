import { ConflictException, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { randomBytes, randomUUID, createHash } from 'node:crypto'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'
import { IsNull } from 'typeorm'
import { readAppConfig } from '../config/app-config.js'
import { DatabaseService } from '../database/database.service.js'
import { EmailVerificationTokenEntity, PasswordResetTokenEntity } from '../database/entities/one-time-token.entity.js'
import { UserSessionEntity } from '../database/entities/session.entity.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import { MailboxService } from './mailbox.service.js'
import type { LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto.js'

const PASSWORD_HASH_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
}

export interface AuthUserView {
  id: string
  displayName: string
  email: string
  emailVerified: boolean
  city: string | null
  avatarUrl: string | null
}

export interface SessionTokens {
  accessToken: string
  refreshToken: string
  refreshTtlSeconds: number
  user: AuthUserView
}

@Injectable()
export class AuthService {
  private readonly config = readAppConfig()
  private readonly jwtSecret = new TextEncoder().encode(this.config.jwtAccessSecret)

  constructor(
    private readonly database: DatabaseService,
    private readonly mailbox: MailboxService,
  ) {}

  async register(input: RegisterDto): Promise<{ userId: string; email: string; emailVerified: false; verificationEmailQueued: true }> {
    const email = input.email.trim().toLowerCase()
    const now = new Date()
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(now.getTime() + 30 * 60_000)

    const user = await this.database.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(UserEntity)
      if (await users.findOne({ where: { email }, select: { id: true } })) throw new ConflictException('Ya existe una cuenta con ese correo.')

      const createdUser = users.create({
        id: randomUUID(),
        displayName: input.displayName.trim(),
        email,
        passwordHash: await argon2.hash(input.password, PASSWORD_HASH_OPTIONS),
        avatarUrl: null,
        city: null,
        emailVerifiedAt: null,
        status: UserStatus.ACTIVE,
      })
      await users.save(createdUser)
      await manager.getRepository(EmailVerificationTokenEntity).save({
        id: randomUUID(),
        userId: createdUser.id,
        tokenHash: hashToken(token),
        expiresAt,
        consumedAt: null,
        revokedAt: null,
      })
      return createdUser
    })

    try {
      await this.mailbox.queue(email, 'verify-email', token, expiresAt)
    } catch {
      throw new ServiceUnavailableException('No se pudo preparar el mensaje local de verificación. Puedes volver a solicitarlo.')
    }

    return { userId: user.id, email: user.email, emailVerified: false, verificationEmailQueued: true }
  }

  async login(input: LoginDto): Promise<SessionTokens> {
    const email = input.email.trim().toLowerCase()
    const user = await this.database.dataSource.getRepository(UserEntity)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne()

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) throw new UnauthorizedException('Correo o contraseña incorrectos.')
    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException('La cuenta no está activa.')
    if (!user.emailVerifiedAt) throw new ForbiddenException('Verifica tu correo antes de iniciar sesión.')

    const now = new Date()
    const refreshTtlSeconds = this.config.refreshTokenTtlDays * 24 * 60 * 60
    const sessionId = randomUUID()
    const refreshToken = `${sessionId}.${randomBytes(32).toString('base64url')}`
    const session = this.database.dataSource.getRepository(UserSessionEntity).create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(now.getTime() + refreshTtlSeconds * 1000),
      revokedAt: null,
    })
    await this.database.dataSource.getRepository(UserSessionEntity).save(session)

    return {
      accessToken: await this.signAccessToken(user.id, session.id),
      refreshToken,
      refreshTtlSeconds,
      user: toAuthUser(user),
    }
  }

  async refresh(refreshToken: string): Promise<SessionTokens> {
    const sessionId = refreshToken.split('.', 1)[0]
    if (!sessionId) throw new UnauthorizedException()

    const result = await this.database.dataSource.transaction(async (manager) => {
      const sessions = manager.getRepository(UserSessionEntity)
      const session = await sessions.findOne({
        where: { id: sessionId },
        select: { id: true, userId: true, refreshTokenHash: true, expiresAt: true, revokedAt: true },
        lock: { mode: 'pessimistic_write' },
      })
      if (!session || session.revokedAt || session.expiresAt <= new Date()) return { kind: 'invalid' as const }
      if (session.refreshTokenHash !== hashToken(refreshToken)) {
        session.revokedAt = new Date()
        await sessions.save(session)
        return { kind: 'reused' as const }
      }

      const user = await manager.getRepository(UserEntity).findOne({
        where: { id: session.userId },
        select: { id: true, displayName: true, email: true, avatarUrl: true, city: true, emailVerifiedAt: true, status: true, role: true },
      })
      if (!user || user.status !== UserStatus.ACTIVE || !user.emailVerifiedAt) {
        session.revokedAt = new Date()
        await sessions.save(session)
        return { kind: 'invalid' as const }
      }

      const nextRefreshToken = `${session.id}.${randomBytes(32).toString('base64url')}`
      const refreshTtlSeconds = this.config.refreshTokenTtlDays * 24 * 60 * 60
      session.refreshTokenHash = hashToken(nextRefreshToken)
      session.expiresAt = new Date(Date.now() + refreshTtlSeconds * 1000)
      await sessions.save(session)
      return { kind: 'rotated' as const, session, user, nextRefreshToken, refreshTtlSeconds }
    })

    if (result.kind !== 'rotated') throw new UnauthorizedException()
    return {
      accessToken: await this.signAccessToken(result.user.id, result.session.id),
      refreshToken: result.nextRefreshToken,
      refreshTtlSeconds: result.refreshTtlSeconds,
      user: toAuthUser(result.user),
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.database.dataSource.getRepository(UserSessionEntity).update(
      { id: sessionId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    )
  }

  async verifyEmail(token: string): Promise<{ emailVerified: true }> {
    const result = await this.database.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(EmailVerificationTokenEntity)
      const record = await tokens.createQueryBuilder('token')
        .addSelect('token.tokenHash')
        .where('token.tokenHash = :hash', { hash: hashToken(token) })
        .andWhere('token.consumedAt IS NULL')
        .andWhere('token.revokedAt IS NULL')
        .setLock('pessimistic_write')
        .getOne()
      if (!record || record.expiresAt <= new Date()) return false
      const user = await manager.getRepository(UserEntity).findOneBy({ id: record.userId })
      if (!user || user.status !== UserStatus.ACTIVE) return false
      user.emailVerifiedAt = new Date()
      record.consumedAt = new Date()
      await manager.getRepository(UserEntity).save(user)
      await tokens.save(record)
      await tokens.createQueryBuilder().update().set({ revokedAt: new Date() })
        .where('user_id = :userId AND id <> :id AND consumed_at IS NULL AND revoked_at IS NULL', { userId: user.id, id: record.id }).execute()
      return true
    })
    if (!result) throw new UnauthorizedException('El enlace de verificación no es válido o ya venció.')
    await this.mailbox.redact(token).catch(() => undefined)
    return { emailVerified: true }
  }

  async resendVerification(emailInput: string): Promise<{ accepted: true }> {
    const email = emailInput.trim().toLowerCase()
    const user = await this.database.dataSource.getRepository(UserEntity).findOneBy({ email, status: UserStatus.ACTIVE })
    if (!user || user.emailVerifiedAt) return { accepted: true }
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 30 * 60_000)
    await this.database.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(EmailVerificationTokenEntity)
      await tokens.createQueryBuilder().update().set({ revokedAt: new Date() })
        .where('user_id = :userId AND consumed_at IS NULL AND revoked_at IS NULL', { userId: user.id }).execute()
      await tokens.save(tokens.create({ id: randomUUID(), userId: user.id, tokenHash: hashToken(token), expiresAt, consumedAt: null, revokedAt: null }))
    })
    await this.queueLocalMail(user.email, 'verify-email', token, expiresAt)
    return { accepted: true }
  }

  async requestPasswordReset(emailInput: string): Promise<{ accepted: true }> {
    const email = emailInput.trim().toLowerCase()
    const user = await this.database.dataSource.getRepository(UserEntity).findOneBy({ email, status: UserStatus.ACTIVE })
    if (!user) return { accepted: true }
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 30 * 60_000)
    await this.database.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(PasswordResetTokenEntity)
      await tokens.createQueryBuilder().update().set({ revokedAt: new Date() })
        .where('user_id = :userId AND consumed_at IS NULL AND revoked_at IS NULL', { userId: user.id }).execute()
      await tokens.save(tokens.create({ id: randomUUID(), userId: user.id, tokenHash: hashToken(token), expiresAt, consumedAt: null, revokedAt: null }))
    })
    await this.queueLocalMail(user.email, 'reset-password', token, expiresAt)
    return { accepted: true }
  }

  async resetPassword(input: ResetPasswordDto): Promise<{ passwordChanged: true }> {
    const changed = await this.database.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(PasswordResetTokenEntity)
      const record = await tokens.createQueryBuilder('token')
        .addSelect('token.tokenHash')
        .where('token.tokenHash = :hash', { hash: hashToken(input.token) })
        .andWhere('token.consumedAt IS NULL')
        .andWhere('token.revokedAt IS NULL')
        .setLock('pessimistic_write')
        .getOne()
      if (!record || record.expiresAt <= new Date()) return false
      const user = await manager.getRepository(UserEntity).findOneBy({ id: record.userId, status: UserStatus.ACTIVE })
      if (!user) return false
      user.passwordHash = await argon2.hash(input.newPassword, PASSWORD_HASH_OPTIONS)
      record.consumedAt = new Date()
      await manager.getRepository(UserEntity).save(user)
      await tokens.save(record)
      await manager.getRepository(UserSessionEntity).createQueryBuilder().update().set({ revokedAt: new Date() })
        .where('user_id = :userId AND revoked_at IS NULL', { userId: user.id }).execute()
      return true
    })
    if (!changed) throw new UnauthorizedException('El enlace de recuperación no es válido o ya venció.')
    await this.mailbox.redact(input.token).catch(() => undefined)
    return { passwordChanged: true }
  }

  toAuthUser(user: UserEntity): AuthUserView {
    return toAuthUser(user)
  }

  private async signAccessToken(userId: string, sessionId: string): Promise<string> {
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTokenTtlSeconds}s`)
      .sign(this.jwtSecret)
  }

  private async queueLocalMail(email: string, purpose: 'verify-email' | 'reset-password', token: string, expiresAt: Date): Promise<void> {
    try {
      await this.mailbox.queue(email, purpose, token, expiresAt)
    } catch {
      throw new ServiceUnavailableException('No se pudo preparar el mensaje local. Puedes volver a solicitarlo.')
    }
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function toAuthUser(user: UserEntity): AuthUserView {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    city: user.city,
    avatarUrl: user.avatarUrl,
  }
}
