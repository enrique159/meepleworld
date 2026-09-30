import { Controller, Get } from '@nestjs/common'
import { DatabaseService } from './database/database.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  async check() {
    await this.database.dataSource.query('SELECT 1')
    return { status: 'ok', database: 'ready', timestamp: new Date().toISOString() }
  }
}
