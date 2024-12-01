import { BonoEntity } from '../bono/bono.entity';
import { ClaseEntity } from '../clase/clase.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cedula: number;

  @Column()
  nombre: string;

  @Column()
  grupoInvestigacion: string;

  @Column()
  extension: number;

  @Column({
    type: 'enum',
    enum: ['Profesor', 'Decana'],
  })
  rol: string;

  @OneToOne(() => UsuarioEntity, (usuario) => usuario.jefe, {
    nullable: true,
  })
  @JoinColumn()
  jefe: UsuarioEntity;

  @OneToMany(() => BonoEntity, (bono) => bono.usuario)
  bonos: BonoEntity[];

  @OneToMany(() => ClaseEntity, (clase) => clase.profesor)
  clases: ClaseEntity[];
}
