import type { DataSourceOptions } from 'typeorm'
import { EmailVerificationTokenEntity, PasswordResetTokenEntity } from './entities/one-time-token.entity.js'
import { GameEntity, LibraryEntryEntity } from './entities/game.entity.js'
import { MarketplaceListingEntity } from './entities/marketplace-listing.entity.js'
import { UserSessionEntity } from './entities/session.entity.js'
import { TableEntity, TableGameEntity, TableParticipationEntity } from './entities/table.entity.js'
import { UserEntity } from './entities/user.entity.js'
import { InitialSchema1790640000000 } from './migrations/InitialSchema1790640000000.js'
import { AddUserUsername1791072000000 } from './migrations/AddUserUsername1791072000000.js'
import type { AppConfig } from '../config/app-config.js'

export const entities = [
  UserEntity,
  UserSessionEntity,
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  GameEntity,
  LibraryEntryEntity,
  TableEntity,
  TableGameEntity,
  TableParticipationEntity,
  MarketplaceListingEntity,
]

export function createDataSourceOptions(config: AppConfig): DataSourceOptions {
  return {
    type: 'mysql',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    charset: 'utf8mb4',
    timezone: 'Z',
    entities,
    migrations: [InitialSchema1790640000000, AddUserUsername1791072000000],
    migrationsTableName: 'typeorm_migrations',
    migrationsTransactionMode: 'each',
    synchronize: false,
    migrationsRun: false,
    logging: false,
  }
}
