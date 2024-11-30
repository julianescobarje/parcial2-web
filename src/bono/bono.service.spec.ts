import { Test, TestingModule } from '@nestjs/testing';
import { BonoService } from './bono.service';

describe('BonoService', () => {
  let service: BonoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BonoService],
    }).compile();

    service = module.get<BonoService>(BonoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
