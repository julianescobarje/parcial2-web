import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaseEntity } from './clase.entity';
import { ClaseController } from './clase.controller';
import { UsuarioEntity } from 'src/usuario/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaseEntity, UsuarioEntity])],
  providers: [ClaseService],
  controllers: [ClaseController],
})
export class ClaseModule {}
