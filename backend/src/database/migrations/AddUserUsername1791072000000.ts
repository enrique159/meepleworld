import { randomInt } from 'node:crypto'
import type { MigrationInterface, QueryRunner } from 'typeorm'
import { isDuplicateKeyError } from '../mysql-errors.js'

export class AddUserUsername1791072000000 implements MigrationInterface {
  name = 'AddUserUsername1791072000000'
  transaction = false

  async up(queryRunner: QueryRunner): Promise<void> {
    // MySQL confirma el DDL por separado; permitir reanudar un relleno interrumpido.
    if (!(await queryRunner.hasColumn('users', 'username'))) {
      await queryRunner.query(`ALTER TABLE users
        ADD COLUMN username VARCHAR(32) COLLATE utf8mb4_unicode_ci NULL AFTER id,
        ADD UNIQUE KEY uq_users_username (username)`)
    }

    while (true) {
      const users: Array<{ id: string }> = await queryRunner.query('SELECT id FROM users WHERE username IS NULL ORDER BY id LIMIT 500')
      if (users.length === 0) break
      for (const user of users) {
        await this.assignUsername(queryRunner, user.id)
      }
    }

    await queryRunner.query('ALTER TABLE users MODIFY COLUMN username VARCHAR(32) COLLATE utf8mb4_unicode_ci NOT NULL')
  }

  private async assignUsername(queryRunner: QueryRunner, userId: string): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const username = `user${Date.now()}${randomInt(0, 100_000).toString().padStart(5, '0')}`
      try {
        // Conservar la fecha de edición del perfil durante el relleno técnico.
        await queryRunner.query('UPDATE users SET username = ?, updated_at = updated_at WHERE id = ? AND username IS NULL', [username, userId])
        return
      } catch (error) {
        if (!isDuplicateKeyError(error, 'uq_users_username')) throw error
      }
    }
    throw new Error('No se pudo asignar un username único durante la migración.')
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP INDEX uq_users_username, DROP COLUMN username')
  }
}
