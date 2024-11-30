import { Module } from '@nestjs/common';
import { BonoService } from './bono.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonoEntity } from './bono.entity';
import { UsuarioEntity } from 'src/usuario/usuario.entity';
import { BonoController } from './bono.controller';
import { ClaseEntity } from 'src/clase/clase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BonoEntity, ClaseEntity, UsuarioEntity])],
  providers: [BonoService],
  controllers: [BonoController],
})
export class BonoModule {}
