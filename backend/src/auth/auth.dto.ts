import { Transform } from 'class-transformer'
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @Length(1, 120)
  displayName!: string

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string
}

export class LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string
}

export class OneTimeTokenDto {
  @IsString()
  @Length(40, 64)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string
}

export class ResetPasswordDto extends OneTimeTokenDto {
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword!: string
}

export class ForgotPasswordDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string
}
