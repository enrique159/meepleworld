export type RuntimeEnvironment = 'development' | 'test' | 'production'
export type SameSitePolicy = 'lax' | 'strict' | 'none'

export interface AppConfig {
  nodeEnv: RuntimeEnvironment
  port: number
  appPublicUrl: string
  corsOrigins: string[]
  database: {
    host: string
    port: number
    name: string
    user: string
    password: string
  }
  jwtAccessSecret: string
  accessTokenTtlSeconds: number
  refreshTokenTtlDays: number
  authCookieSecure: boolean
  authCookieSameSite: SameSitePolicy
  mailDriver: 'filesystem'
  localMailboxPath: string
}

export function readAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV ?? 'development'
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV debe ser development, test o production.')
  }

  const jwtAccessSecret = env.JWT_ACCESS_SECRET ?? ''
  if (jwtAccessSecret.length < 32 || /replace|change-this|example/i.test(jwtAccessSecret)) {
    throw new Error('JWT_ACCESS_SECRET debe contener al menos 32 caracteres aleatorios y no ser el valor de ejemplo.')
  }

  const mailDriver = env.MAIL_DRIVER ?? 'filesystem'
  if (mailDriver !== 'filesystem') {
    throw new Error('El único adaptador de correo disponible es filesystem, solo para desarrollo local.')
  }
  if (nodeEnv === 'production') {
    throw new Error('El adaptador de correo local no está habilitado para producción; configure un proveedor real antes de desplegar.')
  }

  const sameSiteValue = (env.AUTH_COOKIE_SAME_SITE ?? 'lax').toLowerCase()
  if (!['lax', 'strict', 'none'].includes(sameSiteValue)) {
    throw new Error('AUTH_COOKIE_SAME_SITE debe ser lax, strict o none.')
  }

  const port = integerValue(env.PORT ?? '3000', 'PORT', 1, 65535)
  const databasePort = integerValue(env.DB_PORT ?? '3306', 'DB_PORT', 1, 65535)
  const accessTokenTtlSeconds = integerValue(env.ACCESS_TOKEN_TTL_SECONDS ?? '900', 'ACCESS_TOKEN_TTL_SECONDS', 60, 86400)
  const refreshTokenTtlDays = integerValue(env.REFRESH_TOKEN_TTL_DAYS ?? '30', 'REFRESH_TOKEN_TTL_DAYS', 1, 365)
  const corsOrigins = (env.CORS_ORIGINS ?? 'http://localhost:8080,http://127.0.0.1:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  for (const origin of corsOrigins) {
    const parsedOrigin = new URL(origin)
    if (parsedOrigin.origin !== origin || origin === '*') {
      throw new Error(`Origen CORS inválido: ${origin}`)
    }
  }

  const appPublicUrl = env.APP_PUBLIC_URL ?? 'http://localhost:8080'
  const parsedPublicUrl = new URL(appPublicUrl)
  if (parsedPublicUrl.protocol !== 'https:' && nodeEnv === 'production') {
    throw new Error('APP_PUBLIC_URL debe usar HTTPS en producción.')
  }

  const authCookieSecure = boolValue(env.AUTH_COOKIE_SECURE ?? (nodeEnv === 'production' ? 'true' : 'false'), 'AUTH_COOKIE_SECURE')
  if (sameSiteValue === 'none' && !authCookieSecure) {
    throw new Error('AUTH_COOKIE_SECURE debe estar habilitado al usar AUTH_COOKIE_SAME_SITE=none.')
  }

  const required = (name: string, fallback?: string): string => {
    const value = env[name] ?? fallback
    if (value === undefined || value.length === 0) throw new Error(`${name} es obligatorio.`)
    return value
  }

  return {
    nodeEnv: nodeEnv as RuntimeEnvironment,
    port,
    appPublicUrl: parsedPublicUrl.origin,
    corsOrigins,
    database: {
      host: required('DB_HOST', '127.0.0.1'),
      port: databasePort,
      name: required('DB_NAME'),
      user: required('DB_USER'),
      password: required('DB_PASSWORD'),
    },
    jwtAccessSecret,
    accessTokenTtlSeconds,
    refreshTokenTtlDays,
    authCookieSecure,
    authCookieSameSite: sameSiteValue as SameSitePolicy,
    mailDriver,
    localMailboxPath: required('LOCAL_MAILBOX_PATH', '.local/mailbox.jsonl'),
  }
}

function integerValue(value: string, name: string, min: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error(`${name} debe ser un entero entre ${min} y ${max}.`)
  return parsed
}

function boolValue(value: string, name: string): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${name} debe ser true o false.`)
}
