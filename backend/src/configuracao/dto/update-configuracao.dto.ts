import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateConfiguracaoDto {
  @IsOptional() @IsString() nomeBanner?: string;
  @IsOptional() @IsString() descBanner?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imagensBanner?: string[];
  @IsOptional() @IsObject() horariosSemana?: Record<string, { aberto: boolean; horarios: string[] }>;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() whatsapp?: string;
}
