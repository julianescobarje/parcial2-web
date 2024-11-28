import { Module } from '@nestjs/common';
import { BonoService } from './bono.service';

@Module({
  providers: [BonoService]
})
export class BonoModule {}
