import { Injectable, NotFoundException } from '@nestjs/common'
import { IsNull, Not } from 'typeorm'
import { DatabaseService } from '../database/database.service.js'
import { UserEntity, UserStatus } from '../database/entities/user.entity.js'
import type { UpdateProfileDto } from './users.dto.js'

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async getPublicProfile(id: string) {
    const user = await this.database.dataSource.getRepository(UserEntity).findOne({
      where: { id, status: UserStatus.ACTIVE, emailVerifiedAt: Not(IsNull()) },
      select: { id: true, displayName: true, avatarUrl: true, city: true, createdAt: true },
    })
    if (!user) throw new NotFoundException('No se encontró el perfil.')
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      city: user.city,
      memberSince: user.createdAt.toISOString(),
    }
  }

  getPrivateProfile(user: UserEntity) {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      avatarUrl: user.avatarUrl,
      city: user.city,
    }
  }

  async updateProfile(user: UserEntity, input: UpdateProfileDto) {
    if (input.displayName !== undefined) user.displayName = input.displayName.trim()
    if (input.city !== undefined) user.city = input.city?.trim() || null
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl || null
    await this.database.dataSource.getRepository(UserEntity).save(user)
    return this.getPrivateProfile(user)
  }
}
