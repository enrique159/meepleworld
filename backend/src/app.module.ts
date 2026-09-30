import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module.js'
import { DatabaseModule } from './database/database.module.js'
import { GamesModule } from './games/games.module.js'
import { HealthController } from './health.controller.js'
import { MarketplaceModule } from './marketplace/marketplace.module.js'
import { TablesModule } from './tables/tables.module.js'
import { UsersModule } from './users/users.module.js'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GamesModule, TablesModule, MarketplaceModule],
  controllers: [HealthController],
})
export class AppModule {}
