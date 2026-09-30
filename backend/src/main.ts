import 'dotenv/config'
import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ApiExceptionFilter } from './common/api-exception.filter.js'
import { requestIdMiddleware } from './common/request-id.middleware.js'
import { readAppConfig } from './config/app-config.js'
import { AppModule } from './app.module.js'

async function bootstrap(): Promise<void> {
  const config = readAppConfig()
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
  app.use(requestIdMiddleware)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
  }))
  app.useGlobalFilters(new ApiExceptionFilter())
  app.enableShutdownHooks()
  await app.listen(config.port, '0.0.0.0')
}

void bootstrap()
