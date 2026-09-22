import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class CreateAgendamentoDto {
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) data: string;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) hora: string;
  @IsInt() @IsPositive() clienteId: number;
  @IsInt() @IsPositive() barbeiroId: number;
  @IsInt() @IsPositive() servicoId: number;
  @IsOptional() @IsString() observacoes?: string;
}
