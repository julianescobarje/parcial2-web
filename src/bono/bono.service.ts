import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonoEntity } from './bono.entity';
import { UsuarioEntity } from 'src/usuario/usuario.entity';

@Injectable()
export class BonoService {
  constructor(
    @InjectRepository(BonoEntity)
    private readonly bonoRepository: Repository<BonoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async crearBono(bono: BonoEntity, usuarioId: string): Promise<BonoEntity> {
    if (!bono.monto || bono.monto <= 0) {
      throw new BadRequestException(
        'El monto del bono debe ser positivo y no vacío.',
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol !== 'Profesor') {
      throw new BadRequestException(
        'Solo los usuarios con rol de Profesor pueden tener bonos.',
      );
    }

    const nuevoBono = this.bonoRepository.create({
      ...bono,
      usuario,
    });

    return this.bonoRepository.save(nuevoBono);
  }

  async findBonoByCodigo(codigo: string): Promise<BonoEntity[]> {
    const bonos = await this.bonoRepository.find({
      where: { clase: { codigo } },
      relations: ['clase'],
    });

    if (!bonos.length) {
      throw new NotFoundException(
        'No se encontraron bonos para la clase con el código especificado.',
      );
    }

    return bonos;
  }

  async findAllBonosByUsuario(usuarioId: string): Promise<BonoEntity[]> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.bonoRepository.find({
      where: { usuario: { id: usuarioId } },
    });
  }

  async deleteBono(id: string): Promise<void> {
    const bono = await this.bonoRepository.findOne({ where: { id } });

    if (!bono) {
      throw new NotFoundException('Bono no encontrado.');
    }

    if (bono.calificacion > 4) {
      throw new BadRequestException(
        'No se puede eliminar un bono con calificación mayor a 4.',
      );
    }

    await this.bonoRepository.delete(id);
  }
}
