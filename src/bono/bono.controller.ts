import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BonoService } from './bono.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { BonoEntity } from './bono.entity';
import { BonoDto } from './bono.dto';

@Controller('bonos')
@UseInterceptors(BusinessErrorsInterceptor)
export class BonoController {
  constructor(private readonly bonoService: BonoService) {}

  @Post()
  async crearBono(@Body() bonoDto: BonoDto) {
    const bono: BonoEntity = plainToInstance(BonoEntity, bonoDto);
    return await this.bonoService.crearBono(bono);
  }

  @Get('clase/:codigo')
  async findBonoByCodigo(@Param('codigo') codigo: string) {
    return await this.bonoService.findBonoByCodigo(codigo);
  }

  @Get('usuario/:usuarioId')
  async findAllBonosByUsuario(@Param('usuarioId') usuarioId: string) {
    return await this.bonoService.findAllBonosByUsuario(usuarioId);
  }

  @Delete(':bonoId')
  @HttpCode(204)
  async deleteBono(@Param('bonoId') bonoId: string) {
    return await this.bonoService.deleteBono(bonoId);
  }
}
