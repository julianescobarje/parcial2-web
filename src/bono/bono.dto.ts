import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class BonoDto {
  @IsNumber()
  @IsNotEmpty()
  readonly monto: number;

  @IsNumber()
  @IsNotEmpty()
  readonly calificacion: number;

  @IsString()
  @IsNotEmpty()
  readonly palabraClave: string;

  @IsObject()
  @IsNotEmpty()
  readonly usuario: { id: string };

  @IsObject()
  @IsNotEmpty()
  readonly clase: { id: string };
}
