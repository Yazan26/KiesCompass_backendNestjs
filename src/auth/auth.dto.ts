import { IsEmail, MinLength } from 'class-validator';


// validate incoming data for registration and login
export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(10)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(10)
  password: string;
}
