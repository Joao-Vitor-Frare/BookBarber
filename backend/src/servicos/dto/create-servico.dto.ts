import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateServicoDto {
  @IsString() nome: string;
  @IsOptional() @IsString() descricao?: string;
  @IsInt() @IsPositive() precoCentavos: number;
  @IsInt() @IsPositive() duracaoMinutos: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
