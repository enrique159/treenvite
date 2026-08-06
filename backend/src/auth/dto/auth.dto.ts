import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  credential: string;
}

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class EmailDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @MinLength(8)
  password: string;
}
