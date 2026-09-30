import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { readAppConfig } from '../config/app-config.js'
import { createDataSourceOptions } from './database.options.js'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly dataSource = new DataSource(createDataSourceOptions(readAppConfig()))

  async onModuleInit(): Promise<void> {
    await this.dataSource.initialize()
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dataSource.isInitialized) await this.dataSource.destroy()
  }
}
