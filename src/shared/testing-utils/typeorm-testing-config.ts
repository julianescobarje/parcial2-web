import { TypeOrmModule } from '@nestjs/typeorm';
import { BonoEntity } from 'src/bono/bono.entity';
import { ClaseEntity } from 'src/clase/clase.entity';
import { UsuarioEntity } from 'src/usuario/usuario.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [BonoEntity, ClaseEntity, UsuarioEntity],
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([BonoEntity, ClaseEntity, UsuarioEntity]),
];
