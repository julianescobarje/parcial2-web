import { IsNotEmpty, IsPositive, IsString, IsObject } from 'class-validator';

export class ClaseDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly codigo: string;

  @IsPositive()
  @IsNotEmpty()
  readonly creditos: number;

  @IsObject()
  @IsNotEmpty()
  readonly profesor: { id: string };
}
