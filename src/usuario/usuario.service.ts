import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from './usuario.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async crearUsuario(usuario: UsuarioEntity): Promise<UsuarioEntity> {
    const rolesValidos = ['Profesor', 'Decana'];

    if (!rolesValidos.includes(usuario.rol)) {
      throw new BusinessLogicException(
        `El rol debe ser uno de los siguientes: ${rolesValidos.join(', ')}.`,
        BusinessError.PRECONDITION_FAILED,
      );
    }

    if (usuario.rol === 'Profesor') {
      const gruposValidos = ['TICSW', 'IMAGINE', 'COMIT'];
      if (!gruposValidos.includes(usuario.grupoInvestigacion)) {
        throw new BusinessLogicException(
          'El grupo de investigación debe ser TICSW, IMAGINE o COMIT.',
          BusinessError.PRECONDITION_FAILED,
        );
      }
    } else if (usuario.rol === 'Decana') {
      if (!usuario.extension || usuario.extension.toString().length !== 8) {
        throw new BusinessLogicException(
          'El número de extensión debe tener 8 dígitos para Decanas.',
          BusinessError.PRECONDITION_FAILED,
        );
      }
    }

    if (usuario.jefe) {
      const jefeExistente = await this.usuarioRepository.findOne({
        where: { id: usuario.jefe.id },
      });

      if (!jefeExistente) {
        throw new BusinessLogicException(
          'El jefe con el ID proporcionado no existe.',
          BusinessError.NOT_FOUND,
        );
      }

      usuario.jefe = jefeExistente;
    }

    return await this.usuarioRepository.save(usuario);
  }

  async findUsuarioById(id: string): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['jefe', 'bonos', 'clases'],
    });

    if (!usuario) {
      throw new BusinessLogicException(
        'Usuario no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }
    return usuario;
  }

  async eliminarUsuario(id: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['bonos'],
    });

    if (!usuario) {
      throw new BusinessLogicException(
        'Usuario no encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    if (usuario.rol === 'Decana') {
      throw new BusinessLogicException(
        'No se puede eliminar un usuario con rol de Decana.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    if (usuario.bonos && usuario.bonos.length > 0) {
      throw new BusinessLogicException(
        'No se puede eliminar un usuario con bonos asociados.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    await this.usuarioRepository.remove(usuario);
  }
}
