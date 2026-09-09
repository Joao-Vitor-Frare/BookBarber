import { IsDateString, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateAgendamentoDto {
  @IsOptional() @IsDateString() dataHora?: string;
  @IsOptional() @IsInt() @IsPositive() clienteId?: number;
  @IsOptional() @IsInt() @IsPositive() barbeiroId?: number;
  @IsOptional() @IsInt() @IsPositive() servicoId?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsIn(['AGENDADO', 'CONCLUIDO', 'CANCELADO']) status?: string;
}
