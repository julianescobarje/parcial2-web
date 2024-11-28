import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ClaseModule } from './clase/clase.module';
import { BonoModule } from './bono/bono.module';

@Module({
  imports: [UsuarioModule, ClaseModule, BonoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
