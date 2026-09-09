import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateAgendamentoDto {
  @IsDateString()
  dataHora: string;

  @IsInt()
  @IsPositive()
  clienteId: number;

  @IsInt()
  @IsPositive()
  barbeiroId: number;

  @IsInt()
  @IsPositive()
  servicoId: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
