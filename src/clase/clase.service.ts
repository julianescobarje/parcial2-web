import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaseEntity } from './clase.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(ClaseEntity)
    private readonly claseRepository: Repository<ClaseEntity>,
  ) {}

  async crearClase(clase: ClaseEntity): Promise<ClaseEntity> {
    const { codigo } = clase;

    if (!codigo || codigo.length !== 10) {
      throw new BadRequestException(
        'El código debe tener exactamente 10 caracteres.',
      );
    }
    const nuevaClase = this.claseRepository.create(clase);
    return this.claseRepository.save(nuevaClase);
  }

  async findClaseById(id: string): Promise<ClaseEntity> {
    const clase = await this.claseRepository.findOne({ where: { id } });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada.');
    }

    return clase;
  }
}
