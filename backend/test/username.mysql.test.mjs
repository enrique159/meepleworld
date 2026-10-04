import 'reflect-metadata'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SignJWT } from 'jose'
import mysql from 'mysql2/promise'
import { DataSource } from 'typeorm'
import { AccessTokenGuard, VerifiedEmailGuard } from '../dist/auth/access-token.guard.js'
import { AuthController } from '../dist/auth/auth.controller.js'
import { AuthRateLimitGuard } from '../dist/auth/auth-rate-limit.guard.js'
import { AuthService } from '../dist/auth/auth.service.js'
import { ApiExceptionFilter } from '../dist/common/api-exception.filter.js'
import { readAppConfig } from '../dist/config/app-config.js'
import { createDataSourceOptions } from '../dist/database/database.options.js'
import { DatabaseService } from '../dist/database/database.service.js'
import { UserEntity, UserStatus } from '../dist/database/entities/user.entity.js'
import { UserSessionEntity } from '../dist/database/entities/session.entity.js'
import { InitialSchema1790640000000 } from '../dist/database/migrations/InitialSchema1790640000000.js'
import { AddUserUsername1791072000000 } from '../dist/database/migrations/AddUserUsername1791072000000.js'
import { UsersController } from '../dist/users/users.controller.js'
import { UsersService } from '../dist/users/users.service.js'

// Solo conectar a una instancia local temporal habilitada explícitamente. Nunca cargar .env.
const socketPath = process.env.MEEPLEWORLD_TEST_MYSQL_SOCKET

test('username con migraciones reales, MySQL y API HTTP', { skip: !socketPath }, async (t) => {
  const databaseName = `meepleworld_username_test_${randomBytes(8).toString('hex')}`
  Object.assign(process.env, {
    NODE_ENV: 'test', DB_NAME: databaseName, DB_USER: 'root', DB_PASSWORD: 'fixture-not-used',
    JWT_ACCESS_SECRET: randomBytes(32).toString('hex'),
  })
  const config = readAppConfig()
  const options = { ...createDataSourceOptions(config), password: '', extra: { socketPath } }
  const admin = await mysql.createConnection({ socketPath, user: 'root' })
  let database
  let app
  try {
    const [[version]] = await admin.query('SELECT VERSION() AS version')
    t.diagnostic(`MySQL ${version.version}; base temporal ${databaseName}`)
    await admin.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    database = await new DataSource({ ...options, migrations: [InitialSchema1790640000000] }).initialize()
    await database.runMigrations()
    const existingIds = [randomUUID(), randomUUID()]
    const originalDate = new Date('2026-09-01T12:00:00.123Z')
    for (const [index, id] of existingIds.entries()) {
      await database.query('INSERT INTO users (id, display_name, email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, `Persona ${index}`, `existing${index}@example.test`, 'fixture-unused-hash', originalDate, originalDate, originalDate])
    }
    await database.destroy()
    database = await new DataSource(options).initialize()

    await t.test('la migración rellena cuentas previas, preserva UUID y fechas y exige unicidad y NOT NULL', async () => {
      await database.runMigrations()
      const users = await database.getRepository(UserEntity).find()
      assert.equal(users.length, 2)
      assert.equal(new Set(users.map((user) => user.username)).size, 2)
      for (const user of users) {
        assert.match(user.username, /^user\d{18}$/)
        assert.ok(existingIds.includes(user.id))
        assert.equal(user.updatedAt.getTime(), originalDate.getTime())
      }
      await assert.rejects(database.query('UPDATE users SET username = NULL WHERE id = ?', [existingIds[0]]))
      await assert.rejects(database.query('UPDATE users SET username = ? WHERE id = ?', [users[0].username, users[1].id]), (error) => error.driverError.code === 'ER_DUP_ENTRY')
      await assert.rejects(database.query('UPDATE users SET username = ? WHERE id = ?', [users[0].username.toUpperCase(), users[1].id]), (error) => error.driverError.code === 'ER_DUP_ENTRY')
    })

    await t.test('el relleno se puede reanudar sin sobrescribir usernames ya asignados', async () => {
      const preserved = await database.getRepository(UserEntity).findOneByOrFail({ id: existingIds[1] })
      await database.query('ALTER TABLE users MODIFY COLUMN username VARCHAR(32) COLLATE utf8mb4_unicode_ci NULL')
      await database.query('UPDATE users SET username = NULL, updated_at = updated_at WHERE id = ?', [existingIds[0]])
      const runner = database.createQueryRunner()
      try {
        await new AddUserUsername1791072000000().up(runner)
      } finally {
        await runner.release()
      }
      assert.match((await database.getRepository(UserEntity).findOneByOrFail({ id: existingIds[0] })).username, /^user\d{18}$/)
      const unchanged = await database.getRepository(UserEntity).findOneByOrFail({ id: preserved.id })
      assert.equal(unchanged.username, preserved.username)
      assert.equal(unchanged.updatedAt.getTime(), preserved.updatedAt.getTime())
    })

    const databaseService = { dataSource: database }
    const messages = []
    const auth = new AuthService(databaseService, {
      async queue(email, purpose, token) { messages.push({ email, purpose, token }) },
      async redact() {},
    })
    const usersService = new UsersService(databaseService)
    const input = { displayName: 'Persona nueva', email: 'new@example.test', password: 'fixture-password-123' }
    const registration = await auth.register(input)
    assert.match(registration.username, /^user\d{18}$/)
    assert.equal((await database.getRepository(UserEntity).findOneByOrFail({ id: registration.userId })).username, registration.username)
    await auth.verifyEmail(messages[0].token)
    const session = await auth.login(input)
    assert.equal(session.user.username, registration.username)

    class TestModule {}
    Module({
      controllers: [UsersController, AuthController],
      providers: [
        { provide: DatabaseService, useValue: databaseService },
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: auth },
        AccessTokenGuard, VerifiedEmailGuard, AuthRateLimitGuard,
      ],
    })(TestModule)
    app = await NestFactory.create(TestModule, { logger: false })
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new ApiExceptionFilter())
    await app.listen(0, '127.0.0.1')
    const baseUrl = `${await app.getUrl()}/api/v1`
    const request = async (path, { token = session.accessToken, body, method = 'GET', headers = {} } = {}) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      return { status: response.status, body: await response.json() }
    }

    await t.test('edición HTTP normaliza, conserva UUID y muestra el username en perfil y sesión', async () => {
      const result = await request('/users/me', { method: 'PATCH', body: { username: '  Meeple_Player  ' } })
      assert.equal(result.status, 200)
      assert.equal(result.body.username, 'meeple_player')
      assert.equal(result.body.id, registration.userId)
      for (const path of ['/users/me', '/auth/me']) {
        assert.equal((await request(path)).body.username, 'meeple_player')
      }
      const refreshed = await auth.refresh(session.refreshToken)
      assert.equal(refreshed.user.username, 'meeple_player')
      const loggedIn = await auth.login(input)
      assert.equal(loggedIn.user.username, 'meeple_player')
      assert.equal((await request('/users/me', { method: 'PATCH', body: { username: 'MEEPLE_PLAYER' } })).status, 200)
    })

    await t.test('el perfil se encuentra por el nuevo username; el anterior ya no resuelve y no se exponen credenciales', async () => {
      const result = await request('/users/username/MEEPLE_PLAYER')
      assert.equal(result.status, 200)
      assert.equal(result.body.id, registration.userId)
      assert.equal(result.body.username, 'meeple_player')
      assert.deepEqual(Object.keys(result.body).sort(), ['avatarUrl', 'city', 'displayName', 'id', 'memberSince', 'username'])
      assert.equal((await request(`/users/username/${registration.username}`)).status, 404)
      assert.equal((await request(`/users/${registration.userId}`)).body.username, 'meeple_player')
      assert.equal((await request('/users/username/no_existe')).status, 404)
      assert.equal((await request('/users/username/meeple_player', { token: null })).status, 401)
    })

    await t.test('rechaza datos inválidos y no permite personalizar username en el registro', async () => {
      for (const username of [null, '', 'ab', 'a'.repeat(33), 'dos palabras', '@usuario', 'juego-mesa']) {
        assert.equal((await request('/users/me', { method: 'PATCH', body: { username } })).status, 400)
      }
      assert.equal((await request('/auth/register', { method: 'POST', token: null, body: { ...input, email: 'another@example.test', username: 'elegido' } })).status, 400)
      assert.equal((await request('/users/username/ab')).status, 400)
      assert.equal((await request('/users/me')).body.username, 'meeple_player')
    })

    await t.test('dos cuentas compiten por el mismo username; solo una actualiza y la otra recibe 409 sin cambios parciales', async () => {
      const users = await Promise.all(existingIds.map((id) => database.getRepository(UserEntity).findOneByOrFail({ id })))
      const results = await Promise.allSettled(users.map((user, index) => usersService.updateProfile(user, { username: index === 0 ? 'Shared_Name' : 'shared_name', city: 'La Paz' })))
      assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
      const failure = results.find((result) => result.status === 'rejected')
      assert.equal(failure.reason.getStatus(), 409)
      assert.equal(failure.reason.getResponse().code, 'USERNAME_TAKEN')
      const loser = users[results.findIndex((result) => result.status === 'rejected')]
      const unchanged = await database.getRepository(UserEntity).findOneByOrFail({ id: loser.id })
      assert.equal(unchanged.username, loser.username)
      assert.equal(unchanged.city, null)
      const conflict = await request('/users/me', { method: 'PATCH', body: { username: 'SHARED_NAME', displayName: 'Cambio rechazado' } })
      assert.equal(conflict.status, 409)
      assert.equal(conflict.body.code, 'USERNAME_TAKEN')
      assert.equal((await request('/users/me')).body.displayName, input.displayName)
    })

    await t.test('la consulta oculta cuentas suspendidas o sin verificar y exige verificación al solicitante', async () => {
      const repository = database.getRepository(UserEntity)
      const target = await repository.findOneByOrFail({ id: existingIds[0] })
      await repository.update({ id: target.id }, { status: UserStatus.SUSPENDED })
      assert.equal((await request(`/users/username/${target.username}`)).status, 404)
      await repository.update({ id: target.id }, { status: UserStatus.ACTIVE, emailVerifiedAt: null })
      assert.equal((await request(`/users/username/${target.username}`)).status, 404)
      const sessionId = randomUUID()
      await database.getRepository(UserSessionEntity).insert({ id: sessionId, userId: target.id, refreshTokenHash: randomBytes(32).toString('hex'), expiresAt: new Date(Date.now() + 60_000), revokedAt: null })
      const token = await new SignJWT({ sid: sessionId }).setProtectedHeader({ alg: 'HS256' }).setSubject(target.id).setExpirationTime('1m').sign(new TextEncoder().encode(config.jwtAccessSecret))
      assert.equal((await request('/users/username/meeple_player', { token })).status, 403)
    })

    await t.test('la migración se puede revertir y volver a aplicar en la base temporal', async () => {
      await database.undoLastMigration()
      const [[column]] = await admin.query('SELECT COUNT(*) AS total FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [databaseName, 'users', 'username'])
      assert.equal(column.total, 0)
      await database.runMigrations()
      const users = await database.getRepository(UserEntity).find()
      assert.equal(users.length, 3)
      assert.equal(new Set(users.map((user) => user.username)).size, 3)
      assert.ok(users.every((user) => /^user\d{18}$/.test(user.username)))
    })
  } finally {
    if (app) await app.close()
    if (database?.isInitialized) await database.destroy()
    await admin.query(`DROP DATABASE IF EXISTS \`${databaseName}\``)
    await admin.end()
  }
})
