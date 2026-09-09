import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServicoDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsInt() @IsPositive() precoCentavos?: number;
  @IsOptional() @IsInt() @IsPositive() duracaoMinutos?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
