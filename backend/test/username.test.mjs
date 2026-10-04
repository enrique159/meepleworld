import 'reflect-metadata'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { ValidationPipe } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { AuthService } from '../dist/auth/auth.service.js'
import { RegisterDto } from '../dist/auth/auth.dto.js'
import { UserEntity } from '../dist/database/entities/user.entity.js'
import { isDuplicateKeyError } from '../dist/database/mysql-errors.js'
import { UpdateProfileDto, UsernameParamsDto } from '../dist/users/users.dto.js'
import { UsersService } from '../dist/users/users.service.js'
import { generateUsername, USERNAME_GENERATION_ATTEMPTS } from '../dist/users/username.js'

Object.assign(process.env, {
  NODE_ENV: 'test', DB_NAME: 'meepleworld_username_unit', DB_USER: 'fixture', DB_PASSWORD: 'fixture',
  JWT_ACCESS_SECRET: randomBytes(32).toString('hex'),
})

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
const transform = (input, metatype = UpdateProfileDto, type = 'body') => pipe.transform(input, { type, metatype })
const duplicate = (key) => new QueryFailedError('fixture', [], Object.assign(new Error(`Duplicate entry for key 'users.${key}'`), { code: 'ER_DUP_ENTRY' }))

test('el username automático contiene timestamp en milisegundos y exactamente cinco dígitos aleatorios', () => {
  for (let index = 0; index < 200; index++) {
    const before = Date.now()
    const username = generateUsername()
    const after = Date.now()
    assert.match(username, /^user\d{18}$/)
    const timestamp = Number(username.slice(4, -5))
    assert.ok(timestamp >= before && timestamp <= after)
  }
})

test('edición y consulta normalizan mayúsculas y espacios exteriores', async () => {
  assert.equal((await transform({ username: '  Enrique_42  ' })).username, 'enrique_42')
  assert.equal((await transform({ username: '  Enrique_42  ' }, UsernameParamsDto, 'param')).username, 'enrique_42')
  assert.equal((await transform({ username: 'a'.repeat(32) })).username.length, 32)
  assert.equal((await transform({ username: 'abc' })).username, 'abc')
  assert.equal((await transform({ city: 'La Paz' })).username, undefined)
})

test('rechaza usernames vacíos, null, no textuales, demasiado largos o con caracteres inválidos', async () => {
  for (const username of [null, '', '  ', 'ab', 'a'.repeat(33), 123, [], {}, 'dos palabras', 'juego-mesa', '@usuario', 'niño', 'a/b', 'ab\ncd']) {
    await assert.rejects(transform({ username }), (error) => error.getStatus() === 400)
  }
  await assert.rejects(transform({}, UsernameParamsDto, 'param'), (error) => error.getStatus() === 400)
})

test('el registro no permite elegir el username ni enviar propiedades extra', async () => {
  await assert.rejects(transform({ displayName: 'Persona', email: 'fixture@example.test', password: 'fixture-password-123', username: 'elegido' }, RegisterDto), (error) => error.getStatus() === 400)
})

test('la edición actualiza solo los campos solicitados y devuelve el username guardado', async () => {
  const original = { id: 'fixture-id', username: 'anterior', displayName: 'Persona', email: 'fixture@example.test', emailVerifiedAt: new Date(), city: null, avatarUrl: null }
  let stored = { ...original, username: 'cambio_concurrente' }
  const repository = {
    async update(criteria, changes) {
      assert.deepEqual(criteria, { id: original.id })
      stored = { ...stored, ...changes }
    },
    async findOneBy() { return stored },
  }
  const service = new UsersService({ dataSource: { getRepository: () => repository } })
  assert.equal((await service.updateProfile(original, { city: ' La Paz ' })).username, 'cambio_concurrente')
  const profile = await service.updateProfile(original, { username: ' Nuevo_42 ' })
  assert.equal(profile.username, 'nuevo_42')
  assert.equal(profile.id, original.id)
  assert.equal(profile.city, 'La Paz')
  assert.equal(profile.passwordHash, undefined)
})

test('un username ocupado devuelve 409 con un código estable sin modificar la cuenta recibida', async () => {
  const original = { id: 'fixture-id', username: 'anterior' }
  const service = new UsersService({ dataSource: { getRepository: () => ({ async update() { throw duplicate('uq_users_username') } }) } })
  await assert.rejects(service.updateProfile(original, { username: 'ocupado' }), (error) => error.getStatus() === 409 && error.getResponse().code === 'USERNAME_TAKEN')
  assert.equal(original.username, 'anterior')
})

test('errores de otras claves o de conexión no se confunden con un username ocupado', async () => {
  assert.equal(isDuplicateKeyError(duplicate('uq_users_email'), 'uq_users_username'), false)
  const failure = new Error('conexión de pruebas interrumpida')
  const service = new UsersService({ dataSource: { getRepository: () => ({ async update() { throw failure } }) } })
  await assert.rejects(service.updateProfile({ id: 'fixture-id' }, { username: 'nuevo' }), (error) => error === failure)
})

function registrationFixture(failures, key = 'uq_users_username') {
  let attempts = 0
  let tokens = 0
  let emails = 0
  const users = {
    async findOne() { return null },
    create: (user) => user,
    async save() {
      attempts++
      if (attempts <= failures) throw duplicate(key)
    },
  }
  const manager = { getRepository: (entity) => entity === UserEntity ? users : { async save() { tokens++ } } }
  const auth = new AuthService({ dataSource: { transaction: (callback) => callback(manager) } }, { async queue() { emails++ } })
  const register = () => auth.register({ displayName: 'Persona', email: 'fixture@example.test', password: 'fixture-password-123' })
  return { auth, register, counts: () => ({ attempts, tokens, emails }) }
}

test('el registro reintenta una colisión y solo genera token y correo para la cuenta creada', async () => {
  const fixture = registrationFixture(1)
  const response = await fixture.register()
  assert.match(response.username, /^user\d{18}$/)
  assert.deepEqual(fixture.counts(), { attempts: 2, tokens: 1, emails: 1 })
  assert.equal(fixture.auth.toAuthUser({ id: response.userId, username: response.username }).username, response.username)
})

test('las colisiones reiteradas terminan con 503 sin token ni correo', async () => {
  const fixture = registrationFixture(USERNAME_GENERATION_ATTEMPTS)
  await assert.rejects(fixture.register(), (error) => error.getStatus() === 503)
  assert.deepEqual(fixture.counts(), { attempts: USERNAME_GENERATION_ATTEMPTS, tokens: 0, emails: 0 })
})

test('una colisión de correo durante el registro sigue siendo 409 y no reintenta usernames', async () => {
  const fixture = registrationFixture(1, 'uq_users_email')
  await assert.rejects(fixture.register(), (error) => error.getStatus() === 409)
  assert.deepEqual(fixture.counts(), { attempts: 1, tokens: 0, emails: 0 })
})
