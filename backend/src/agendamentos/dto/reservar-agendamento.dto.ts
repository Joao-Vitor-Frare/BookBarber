import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class ReservarAgendamentoDto {
  @IsString() @IsNotEmpty() nomeCliente: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() telefone: string;
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) data: string;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) hora: string;
  @IsOptional() @IsInt() @IsPositive() barbeiroId?: number;
  @IsOptional() @IsInt() @IsPositive() servicoId?: number;
  @IsOptional() @IsString() observacoes?: string;
}
