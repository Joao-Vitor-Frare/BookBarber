import { IsIn, IsInt, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class UpdateAgendamentoDto {
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) data?: string;
  @IsOptional() @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) hora?: string;
  @IsOptional() @IsInt() @IsPositive() clienteId?: number;
  @IsOptional() @IsInt() @IsPositive() barbeiroId?: number;
  @IsOptional() @IsInt() @IsPositive() servicoId?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsIn(['AGENDADO', 'CONCLUIDO', 'CANCELADO']) status?: string;
}
