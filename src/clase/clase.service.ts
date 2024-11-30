import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaseEntity } from './clase.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { UsuarioEntity } from 'src/usuario/usuario.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(ClaseEntity)
    private readonly claseRepository: Repository<ClaseEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async crearClase(clase: ClaseEntity): Promise<ClaseEntity> {
    const { codigo, profesor } = clase;

    if (!codigo || codigo.length !== 10) {
      throw new BusinessLogicException(
        'El código debe tener exactamente 10 caracteres.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: profesor.id },
    });

    if (!usuario) {
      throw new BusinessLogicException(
        'Usuario no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    if (usuario.rol !== 'Profesor') {
      throw new BusinessLogicException(
        'El usuario debe ser un Profesor para crear una clase.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return await this.claseRepository.save({ ...clase, profesor: usuario });
  }

  async findClaseById(id: string): Promise<ClaseEntity> {
    const clase = await this.claseRepository.findOne({
      where: { id },
      relations: ['bonos'],
    });

    if (!clase) {
      throw new BusinessLogicException(
        'Clase no encontrada.',
        BusinessError.NOT_FOUND,
      );
    }

    return clase;
  }
}
