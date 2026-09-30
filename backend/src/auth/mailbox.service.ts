import { Injectable } from '@nestjs/common'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { readAppConfig } from '../config/app-config.js'

@Injectable()
export class MailboxService {
  private readonly config = readAppConfig()
  private pendingWrite: Promise<void> = Promise.resolve()

  async queue(to: string, purpose: 'verify-email' | 'reset-password', token: string, expiresAt: Date): Promise<void> {
    const path = resolve(process.cwd(), this.config.localMailboxPath)
    const message = {
      createdAt: new Date().toISOString(),
      to,
      purpose,
      expiresAt: expiresAt.toISOString(),
      instruction: purpose === 'verify-email'
        ? 'Envía el campo token a POST /api/v1/auth/verify-email.'
        : 'Envía los campos token y newPassword a POST /api/v1/auth/password/reset.',
      token,
    }
    await this.serialize(async () => {
      await mkdir(dirname(path), { recursive: true, mode: 0o700 })
      const prior = await this.readMessages(path)
      const retained = prior.map((entry) => entry.to === to && entry.purpose === purpose
        ? { ...entry, token: '[replaced]' }
        : entry)
      retained.push(message)
      await writeFile(path, retained.map((entry) => JSON.stringify(entry)).join('\n') + '\n', { encoding: 'utf8', mode: 0o600 })
      await chmod(path, 0o600)
    })
  }

  async redact(token: string): Promise<void> {
    const path = resolve(process.cwd(), this.config.localMailboxPath)
    await this.serialize(async () => {
      const messages = await this.readMessages(path)
      if (!messages.some((entry) => entry.token === token)) return
      const redacted = messages.map((entry) => entry.token === token ? { ...entry, token: '[used]' } : entry)
      await writeFile(path, redacted.map((entry) => JSON.stringify(entry)).join('\n') + '\n', { encoding: 'utf8', mode: 0o600 })
      await chmod(path, 0o600)
    })
  }

  private async readMessages(path: string): Promise<Array<Record<string, string>>> {
    try {
      const contents = await readFile(path, 'utf8')
      return contents.split('\n').filter(Boolean).flatMap((line) => {
        try {
          const value: unknown = JSON.parse(line)
          return isMailboxMessage(value) ? [value] : []
        } catch {
          return []
        }
      })
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return []
      throw error
    }
  }

  private async serialize(operation: () => Promise<void>): Promise<void> {
    const next = this.pendingWrite.then(operation)
    this.pendingWrite = next.catch(() => undefined)
    return next
  }
}

function isMailboxMessage(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null && 'to' in value && typeof value.to === 'string' &&
    'purpose' in value && typeof value.purpose === 'string' && 'token' in value && typeof value.token === 'string'
}
