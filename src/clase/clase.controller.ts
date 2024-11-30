import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { ClaseService } from './clase.service';
import { ClaseEntity } from './clase.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClaseDto } from './clase.dto';
import { plainToInstance } from 'class-transformer';

@Controller('clases')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClaseController {
  constructor(private readonly claseService: ClaseService) {}

  @Post()
  async crearClase(@Body() claseDto: ClaseDto) {
    const clase: ClaseEntity = plainToInstance(ClaseEntity, claseDto);
    return await this.claseService.crearClase(clase);
  }

  @Get(':claseId')
  async findClaseById(@Param('claseId') claseId: string) {
    return await this.claseService.findClaseById(claseId);
  }
}
