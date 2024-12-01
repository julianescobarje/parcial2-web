import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonoEntity } from './bono.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ClaseEntity } from '../clase/clase.entity';

@Injectable()
export class BonoService {
  constructor(
    @InjectRepository(BonoEntity)
    private readonly bonoRepository: Repository<BonoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(ClaseEntity)
    private readonly claseRepository: Repository<ClaseEntity>,
  ) {}

  async crearBono(bono: BonoEntity): Promise<BonoEntity> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: bono.usuario.id },
      relations: ['clases'],
    });

    if (!usuario) {
      throw new BusinessLogicException(
        'Usuario no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    if (usuario.rol !== 'Profesor') {
      throw new BusinessLogicException(
        'Solo los usuarios con rol de Profesor pueden tener bonos.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    const clase = await this.claseRepository.findOne({
      where: { id: bono.clase.id },
    });

    if (!clase) {
      throw new BusinessLogicException(
        'Clase no encontrada.',
        BusinessError.NOT_FOUND,
      );
    }

    if (!usuario.clases.some((usuarioClase) => usuarioClase.id === clase.id)) {
      throw new BusinessLogicException(
        'El profesor no está asociado con esta clase.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return await this.bonoRepository.save({ ...bono, usuario, clase });
  }

  async findBonoByCodigo(codigo: string): Promise<BonoEntity[]> {
    const bonos = await this.bonoRepository.find({
      where: { clase: { codigo } },
      relations: ['clase'],
    });

    if (!bonos.length) {
      throw new BusinessLogicException(
        'No se encontraron bonos para la clase con el código especificado.',
        BusinessError.NOT_FOUND,
      );
    }

    return bonos;
  }

  async findAllBonosByUsuario(usuarioId: string): Promise<BonoEntity[]> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new BusinessLogicException(
        'Usuario no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    return this.bonoRepository.find({
      where: { usuario: { id: usuarioId } },
    });
  }

  async deleteBono(id: string): Promise<void> {
    const bono = await this.bonoRepository.findOne({ where: { id } });

    if (!bono) {
      throw new BusinessLogicException(
        'Bono no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    if (bono.calificacion > 4) {
      throw new BusinessLogicException(
        'No se puede eliminar un bono con calificación mayor a 4.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    await this.bonoRepository.remove(bono);
  }
}
