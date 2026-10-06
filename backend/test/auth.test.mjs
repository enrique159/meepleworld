import 'reflect-metadata'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AuthController } from '../dist/auth/auth.controller.js'
import { AuthService } from '../dist/auth/auth.service.js'
import { AccessTokenGuard } from '../dist/auth/access-token.guard.js'
import { AuthRateLimitGuard } from '../dist/auth/auth-rate-limit.guard.js'
import { RefreshTokenDto, RegisterDto } from '../dist/auth/auth.dto.js'
import { ApiExceptionFilter } from '../dist/common/api-exception.filter.js'
import { DatabaseService } from '../dist/database/database.service.js'
import { UserEntity, UserStatus } from '../dist/database/entities/user.entity.js'
import { UserSessionEntity } from '../dist/database/entities/session.entity.js'

Object.assign(process.env, {
  NODE_ENV: 'test', DB_NAME: 'meepleworld_auth_unit', DB_USER: 'fixture', DB_PASSWORD: 'fixture',
  JWT_ACCESS_SECRET: randomBytes(32).toString('hex'),
})

const input = { displayName: 'Persona de prueba', email: 'auth@example.test', password: 'fixture-password-123' }
const unauthorized = (error) => error.getStatus() === 401

function fixture(environment = 'test') {
  const users = new Map()
  const sessions = new Map()
  const tokens = []
  const messages = []
  const userRepository = {
    create: (value) => value,
    async save(user) { users.set(user.id, { ...user }); return user },
    async findOne({ where }) { return [...users.values()].find((user) => Object.entries(where).every(([key, value]) => user[key] === value)) ?? null },
    createQueryBuilder() {
      let email
      return {
        addSelect() { return this },
        where(_sql, params) { email = params.email; return this },
        async getOne() { return [...users.values()].find((user) => user.email === email) ?? null },
      }
    },
  }
  const sessionRepository = {
    create: (value) => value,
    async save(session) { sessions.set(session.id, { ...session }); return session },
    async findOne({ where }) {
      const session = sessions.get(where.id)
      if (!session || (where.userId && session.userId !== where.userId) || ('revokedAt' in where && session.revokedAt)) return null
      return { ...session }
    },
    async update({ id }, changes) { Object.assign(sessions.get(id), changes) },
  }
  const manager = {
    getRepository(entity) {
      if (entity === UserEntity) return userRepository
      if (entity === UserSessionEntity) return sessionRepository
      return { async save(token) { tokens.push(token) } }
    },
  }
  const database = { dataSource: { ...manager, transaction: (callback) => callback(manager) } }
  const auth = new AuthService(database, { async queue(...message) { messages.push(message) } })
  // El proveedor de producción sigue bloqueado. Aislamos su regla de registro con un adaptador controlado.
  auth.config.nodeEnv = environment
  return { auth, database, users, sessions, tokens, messages }
}

for (const environment of ['development', 'test']) {
  test(`registro en ${environment}: verificación persistida sin token ni envío y login real`, async () => {
    const context = fixture(environment)
    const response = await context.auth.register(input)
    assert.equal(response.emailVerified, true)
    assert.equal(response.verificationEmailQueued, false)
    assert.ok(context.users.get(response.userId).emailVerifiedAt instanceof Date)
    assert.equal(context.tokens.length, 0)
    assert.equal(context.messages.length, 0)
    assert.equal(context.sessions.size, 0, 'registrarse no inicia sesión')
    const session = await context.auth.login(input)
    assert.equal(session.user.id, response.userId)
    assert.ok(session.user.emailVerified)
    assert.match(session.refreshToken, /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/)
    assert.notEqual([...context.sessions.values()][0].refreshTokenHash, session.refreshToken)
    assert.equal(session.user.passwordHash, undefined)
  })
}

test('registro de producción exige confirmación y mantiene el token solo como hash', async () => {
  const context = fixture('production')
  const response = await context.auth.register(input)
  assert.equal(response.emailVerified, false)
  assert.equal(response.verificationEmailQueued, true)
  assert.equal(context.users.get(response.userId).emailVerifiedAt, null)
  assert.equal(context.tokens.length, 1)
  assert.equal(context.messages.length, 1)
  assert.notEqual(context.tokens[0].tokenHash, context.messages[0][2])
  await assert.rejects(context.auth.login(input), (error) => error.getStatus() === 403)
})

test('la renovación rota y la reutilización revoca también la credencial nueva', async () => {
  const { auth, sessions } = fixture()
  await auth.register(input)
  const first = await auth.login(input)
  const second = await auth.refresh(first.refreshToken)
  assert.notEqual(second.refreshToken, first.refreshToken)
  await assert.rejects(auth.refresh(first.refreshToken), unauthorized)
  await assert.rejects(auth.refresh(second.refreshToken), unauthorized)
  assert.ok([...sessions.values()][0].revokedAt)
})

test('cierre, expiración y suspensión impiden renovar', async () => {
  for (const reason of ['logout', 'expired', 'suspended']) {
    const { auth, users, sessions } = fixture()
    const registration = await auth.register(input)
    const tokens = await auth.login(input)
    const session = [...sessions.values()][0]
    if (reason === 'logout') await auth.revokeSession(session.id)
    if (reason === 'expired') session.expiresAt = new Date(0)
    if (reason === 'suspended') users.get(registration.userId).status = UserStatus.SUSPENDED
    await assert.rejects(auth.refresh(tokens.refreshToken), unauthorized)
  }
})

test('validación: nombre vacío tras recortar y renovación ausente, mal formada o con propiedades extra', async () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
  const transform = (value, metatype) => pipe.transform(value, { type: 'body', metatype })
  await assert.rejects(transform({ ...input, displayName: '   ' }, RegisterDto), (error) => error.getStatus() === 400)
  for (const value of [{}, { refreshToken: '' }, { refreshToken: 123 }, { refreshToken: 'invalid' }, { refreshToken: 'a'.repeat(80), ignored: true }]) {
    await assert.rejects(transform(value, RefreshTokenDto), (error) => error.getStatus() === 400)
  }
})

test('HTTP móvil: registro, tokens en JSON sin cookie, renovación por cuerpo y revocación bearer', async () => {
  const { auth, database } = fixture()
  class TestModule {}
  Module({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: DatabaseService, useValue: database },
      AuthRateLimitGuard, AccessTokenGuard,
    ],
  })(TestModule)
  const app = await NestFactory.create(TestModule, { logger: false })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new ApiExceptionFilter())
  try {
    await app.listen(0, '127.0.0.1')
    const baseUrl = await app.getUrl()
    const post = (path, body, headers = {}) => fetch(`${baseUrl}/api/v1/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const registered = await post('register', { ...input, displayName: '  Persona  ' })
    assert.equal(registered.status, 201)
    assert.equal((await registered.json()).emailVerified, true)
    const login = await post('login', { email: input.email, password: input.password }, { Origin: 'https://fixture.example.test' })
    assert.equal(login.status, 200)
    assert.equal(login.headers.get('set-cookie'), null)
    assert.equal(login.headers.get('access-control-allow-origin'), null)
    assert.equal(login.headers.get('cache-control'), 'no-store')
    const first = await login.json()
    assert.equal(first.expiresIn, 900)
    assert.equal(first.refreshExpiresIn, 30 * 86400)
    assert.equal(first.user.displayName, 'Persona')
    assert.equal((await post('refresh', {}, { Cookie: `meepleworld_refresh=${first.refreshToken}` })).status, 400)
    const refresh = await post('refresh', { refreshToken: first.refreshToken })
    assert.equal(refresh.status, 200)
    assert.equal(refresh.headers.get('set-cookie'), null)
    const second = await refresh.json()
    assert.notEqual(second.refreshToken, first.refreshToken)
    assert.equal((await post('logout')).status, 401)
    assert.equal((await post('logout', undefined, { Authorization: `Bearer ${second.accessToken}` })).status, 204)
    assert.equal((await post('refresh', { refreshToken: second.refreshToken })).status, 401)
  } finally {
    await app.close()
  }
})
