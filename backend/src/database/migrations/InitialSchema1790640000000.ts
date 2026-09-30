import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1790640000000 implements MigrationInterface {
  name = 'InitialSchema1790640000000'
  transaction = false

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE users (
      id CHAR(36) NOT NULL,
      display_name VARCHAR(120) NOT NULL,
      email VARCHAR(254) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(2048) NULL,
      city VARCHAR(120) NULL,
      email_verified_at DATETIME(3) NULL,
      status ENUM('active','suspended','closed') NOT NULL DEFAULT 'active',
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email),
      KEY idx_users_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE user_sessions (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      refresh_token_hash CHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      revoked_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_user_sessions_refresh_hash (refresh_token_hash),
      KEY idx_user_sessions_user_expiry (user_id, expires_at),
      CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE email_verification_tokens (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      consumed_at DATETIME(3) NULL,
      revoked_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_email_verification_hash (token_hash),
      KEY idx_email_verification_user_expiry (user_id, expires_at),
      CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE password_reset_tokens (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      consumed_at DATETIME(3) NULL,
      revoked_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_password_reset_hash (token_hash),
      KEY idx_password_reset_user_expiry (user_id, expires_at),
      CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE games (
      id CHAR(36) NOT NULL,
      name VARCHAR(180) NOT NULL,
      image_url VARCHAR(2048) NULL,
      min_players SMALLINT UNSIGNED NULL,
      max_players SMALLINT UNSIGNED NULL,
      playing_time_minutes SMALLINT UNSIGNED NULL,
      bgg_id INT UNSIGNED NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_games_bgg_id (bgg_id),
      KEY idx_games_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE library_entries (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      game_id CHAR(36) NOT NULL,
      source ENUM('manual','bgg') NOT NULL DEFAULT 'manual',
      bgg_user_name VARCHAR(120) NULL,
      added_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_library_entries_user_game (user_id, game_id),
      KEY idx_library_entries_game (game_id),
      CONSTRAINT fk_library_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_library_entries_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE game_tables (
      id CHAR(36) NOT NULL,
      host_user_id CHAR(36) NOT NULL,
      title VARCHAR(160) NOT NULL,
      description TEXT NOT NULL,
      city VARCHAR(120) NOT NULL,
      starts_at DATETIME(3) NOT NULL,
      time_zone VARCHAR(64) NOT NULL,
      duration_minutes SMALLINT UNSIGNED NULL,
      initial_group_size SMALLINT UNSIGNED NOT NULL,
      offered_seats SMALLINT UNSIGNED NOT NULL,
      access_mode ENUM('open','approval') NOT NULL,
      location_visibility ENUM('public','confirmed-only') NOT NULL,
      address_line VARCHAR(240) NULL,
      latitude DECIMAL(10,7) NULL,
      longitude DECIMAL(10,7) NULL,
      public_latitude DECIMAL(10,7) NULL,
      public_longitude DECIMAL(10,7) NULL,
      fee_mxn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      amenities JSON NOT NULL,
      instructions TEXT NULL,
      status ENUM('published','in_progress','finished','cancelled','removed') NOT NULL DEFAULT 'published',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_game_tables_city_start (city, starts_at),
      KEY idx_game_tables_status_start (status, starts_at),
      KEY idx_game_tables_host (host_user_id, status),
      CONSTRAINT fk_game_tables_host FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE table_games (
      table_id CHAR(36) NOT NULL,
      game_id CHAR(36) NOT NULL,
      PRIMARY KEY (table_id, game_id),
      KEY idx_table_games_game (game_id),
      CONSTRAINT fk_table_games_table FOREIGN KEY (table_id) REFERENCES game_tables(id) ON DELETE CASCADE,
      CONSTRAINT fk_table_games_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE table_participations (
      id CHAR(36) NOT NULL,
      table_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      requested_seats SMALLINT UNSIGNED NOT NULL,
      offered_seats SMALLINT UNSIGNED NULL,
      confirmed_seats SMALLINT UNSIGNED NULL,
      status ENUM('pending','partial_offered','confirmed','rejected','cancelled','withdrawn','expired') NOT NULL DEFAULT 'pending',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_table_participations_table_status (table_id, status),
      KEY idx_table_participations_user_status (user_id, status),
      CONSTRAINT fk_table_participations_table FOREIGN KEY (table_id) REFERENCES game_tables(id) ON DELETE CASCADE,
      CONSTRAINT fk_table_participations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

    await queryRunner.query(`CREATE TABLE marketplace_listings (
      id CHAR(36) NOT NULL,
      author_user_id CHAR(36) NOT NULL,
      game_id CHAR(36) NOT NULL,
      kind ENUM('sale','wanted') NOT NULL,
      description TEXT NOT NULL,
      city VARCHAR(120) NOT NULL,
      game_condition ENUM('new','like-new','good','fair','poor') NULL,
      price_mxn DECIMAL(10,2) NULL,
      budget_mxn DECIMAL(10,2) NULL,
      image_urls JSON NOT NULL,
      status ENUM('active','sold','resolved','closed','removed') NOT NULL DEFAULT 'active',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_marketplace_status_kind_created (status, kind, created_at),
      KEY idx_marketplace_city_created (city, created_at),
      KEY idx_marketplace_author_status (author_user_id, status),
      CONSTRAINT fk_marketplace_author FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_marketplace_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE marketplace_listings')
    await queryRunner.query('DROP TABLE table_participations')
    await queryRunner.query('DROP TABLE table_games')
    await queryRunner.query('DROP TABLE game_tables')
    await queryRunner.query('DROP TABLE library_entries')
    await queryRunner.query('DROP TABLE games')
    await queryRunner.query('DROP TABLE password_reset_tokens')
    await queryRunner.query('DROP TABLE email_verification_tokens')
    await queryRunner.query('DROP TABLE user_sessions')
    await queryRunner.query('DROP TABLE users')
  }
}
