import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @IsString() @IsNotEmpty() nome: string;
  @IsInt() @IsPositive() precoCentavos: number;
  @IsOptional() @IsString() imagem?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
}
