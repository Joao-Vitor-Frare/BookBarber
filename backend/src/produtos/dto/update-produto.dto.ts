import { IsBoolean, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProdutoDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsInt() @IsPositive() precoCentavos?: number;
  @IsOptional() @IsString() imagem?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
}
