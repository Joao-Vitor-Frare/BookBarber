import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CadastroDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;
}
