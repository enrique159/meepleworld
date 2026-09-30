import 'dotenv/config'
import { DataSource } from 'typeorm'
import { readAppConfig } from '../config/app-config.js'
import { createDataSourceOptions } from './database.options.js'

export default new DataSource(createDataSourceOptions(readAppConfig()))
