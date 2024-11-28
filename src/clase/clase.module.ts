import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';

@Module({
  providers: [ClaseService],
})
export class ClaseModule {}
