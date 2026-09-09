import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBarbeiroDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  especialidade?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
