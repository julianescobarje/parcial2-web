import { Test, TestingModule } from '@nestjs/testing';
import { ClaseService } from './clase.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClaseEntity } from './clase.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClaseService', () => {
  let service: ClaseService;
  let claseRepository: Repository<ClaseEntity>;
  let usuarioRepository: Repository<UsuarioEntity>;
  let profesor: UsuarioEntity;

  const seedDatabase = async () => {
    claseRepository.clear();
    usuarioRepository.clear();
    profesor = usuarioRepository.create({
      cedula: faker.number.int({ min: 10000000, max: 99999999 }),
      nombre: faker.person.fullName(),
      grupoInvestigacion: 'TICSW',
      extension: 12345678,
      rol: 'Profesor',
    });
    await usuarioRepository.save(profesor);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClaseService],
    }).compile();

    service = module.get<ClaseService>(ClaseService);
    claseRepository = module.get<Repository<ClaseEntity>>(
      getRepositoryToken(ClaseEntity),
    );
    usuarioRepository = module.get<Repository<UsuarioEntity>>(
      getRepositoryToken(UsuarioEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearClase', () => {
    it('debería crear una clase con un profesor válido', async () => {
      const clase = {
        nombre: faker.lorem.words(3),
        codigo: 'ABCDEFGHIJ',
        creditos: faker.number.int({ min: 1, max: 10 }),
        profesor,
      } as ClaseEntity;

      const resultado = await service.crearClase(clase);
      expect(resultado).toHaveProperty('id');
      expect(resultado.codigo).toBe('ABCDEFGHIJ');
      expect(resultado.profesor.id).toBe(profesor.id);
    });

    it('debería lanzar excepción si el código no tiene 10 caracteres', async () => {
      const clase = {
        codigo: 'ABC',
        profesor,
      } as ClaseEntity;

      await expect(service.crearClase(clase)).rejects.toHaveProperty(
        'message',
        'El código debe tener exactamente 10 caracteres.',
      );
    });

    it('debería lanzar excepción si el profesor no existe', async () => {
      const clase = {
        codigo: 'ABCDEFGHIJ',
        profesor: {
          id: '00000000-0000-0000-0000-000000000000',
        } as UsuarioEntity,
      } as ClaseEntity;

      await expect(service.crearClase(clase)).rejects.toHaveProperty(
        'message',
        'Usuario no encontrado.',
      );
    });

    it('debería lanzar excepción si el usuario no tiene el rol de "Profesor"', async () => {
      const decana = usuarioRepository.create({
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Decana',
      });
      await usuarioRepository.save(decana);

      const clase = {
        codigo: 'ABCDEFGHIJ',
        profesor: decana,
      } as ClaseEntity;

      await expect(service.crearClase(clase)).rejects.toHaveProperty(
        'message',
        'El usuario debe ser un Profesor para crear una clase.',
      );
    });
  });

  describe('findClaseById', () => {
    it('debería retornar una clase por ID', async () => {
      const clase = {
        nombre: faker.lorem.words(3),
        codigo: 'ABCDEFGHIJ',
        creditos: faker.number.int({ min: 1, max: 10 }),
        profesor,
      } as ClaseEntity;

      const claseGuardada = await service.crearClase(clase);
      const resultado = await service.findClaseById(claseGuardada.id);
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(claseGuardada.id);
    });

    it('debería lanzar excepción si la clase no existe', async () => {
      const idInvalido = '00000000-0000-0000-0000-000000000000';
      await expect(service.findClaseById(idInvalido)).rejects.toHaveProperty(
        'message',
        'Clase no encontrada.',
      );
    });
  });
});
