import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async crearUsuario(usuario: UsuarioEntity): Promise<UsuarioEntity> {
    if (usuario.rol === 'Profesor') {
      const gruposValidos = ['TICSW', 'IMAGINE', 'COMIT'];
      if (!gruposValidos.includes(usuario.grupoInvestigacion)) {
        throw new BadRequestException(
          'El grupo de investigación debe ser TICSW, IMAGINE o COMIT.',
        );
      }
    } else if (usuario.rol === 'Decana') {
      if (!usuario.extension || usuario.extension.toString().length !== 8) {
        throw new BadRequestException(
          'El número de extensión debe tener 8 dígitos para Decanas.',
        );
      }
    }

    const nuevoUsuario = this.usuarioRepository.create(usuario);
    return this.usuarioRepository.save(nuevoUsuario);
  }

  async findUsuarioById(id: string): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['jefe', 'bonos', 'clases'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return usuario;
  }

  async eliminarUsuario(id: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['bonos'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol === 'Decana') {
      throw new BadRequestException(
        'No se puede eliminar un usuario con rol de Decana.',
      );
    }

    if (usuario.bonos && usuario.bonos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un usuario con bonos asociados.',
      );
    }

    await this.usuarioRepository.delete(id);
  }
}
