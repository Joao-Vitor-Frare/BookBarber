import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBarbeiroDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() especialidade?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
