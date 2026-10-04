import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { IsNull, Not } from 'typeorm'
import { DatabaseService } from '../database/database.service.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import { isDuplicateKeyError } from '../database/mysql-errors.js'
import type { UpdateProfileDto } from './users.dto.js'
import { normalizeUsername } from './username.js'

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async getPublicProfile(id: string) {
    return this.findPublicProfile({ id })
  }

  async getPublicProfileByUsername(username: string) {
    return this.findPublicProfile({ username: normalizeUsername(username) })
  }

  private async findPublicProfile(identifier: { id: string } | { username: string }) {
    const user = await this.database.dataSource.getRepository(UserEntity).findOne({
      where: { ...identifier, status: UserStatus.ACTIVE, emailVerifiedAt: Not(IsNull()) },
      select: { id: true, username: true, displayName: true, avatarUrl: true, city: true, createdAt: true },
    })
    if (!user) throw new NotFoundException('No se encontró el perfil.')
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      city: user.city,
      memberSince: user.createdAt.toISOString(),
    }
  }

  getPrivateProfile(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      avatarUrl: user.avatarUrl,
      city: user.city,
    }
  }

  async updateProfile(user: UserEntity, input: UpdateProfileDto) {
    const changes: Partial<UserEntity> = {}
    if (input.username !== undefined) changes.username = normalizeUsername(input.username)
    if (input.displayName !== undefined) changes.displayName = input.displayName.trim()
    if (input.city !== undefined) changes.city = input.city?.trim() || null
    if (input.avatarUrl !== undefined) changes.avatarUrl = input.avatarUrl || null
    if (Object.keys(changes).length === 0) return this.getPrivateProfile(user)

    const users = this.database.dataSource.getRepository(UserEntity)
    try {
      await users.update({ id: user.id }, changes)
    } catch (error) {
      if (isDuplicateKeyError(error, 'uq_users_username')) {
        throw new ConflictException({ code: 'USERNAME_TAKEN', message: 'Ese username ya está en uso. Elige otro.' })
      }
      throw error
    }
    const updatedUser = await users.findOneBy({ id: user.id })
    if (!updatedUser) throw new NotFoundException('No se encontró el perfil.')
    return this.getPrivateProfile(updatedUser)
  }
}
