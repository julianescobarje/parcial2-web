import { Test, TestingModule } from '@nestjs/testing';
import { BonoService } from './bono.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { BonoEntity } from './bono.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { ClaseEntity } from '../clase/clase.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('BonoService', () => {
  let service: BonoService;
  let bonoRepository: Repository<BonoEntity>;
  let usuarioRepository: Repository<UsuarioEntity>;
  let claseRepository: Repository<ClaseEntity>;
  let profesor: UsuarioEntity;
  let clase: ClaseEntity;

  const seedDatabase = async () => {
    bonoRepository.clear();
    usuarioRepository.clear();
    claseRepository.clear();

    // Crear al profesor
    profesor = usuarioRepository.create({
      cedula: faker.number.int({ min: 10000000, max: 99999999 }),
      nombre: faker.person.fullName(),
      grupoInvestigacion: 'TICSW',
      extension: 12345678,
      rol: 'Profesor',
    });

    // Asegurarse de que el profesor se guarde correctamente
    profesor = await usuarioRepository.save(profesor);

    // Crear la clase
    clase = claseRepository.create({
      nombre: 'Clase Test',
      codigo: 'ABC1234567',
      creditos: 5,
    });
    await claseRepository.save(clase);

    // Asociar al profesor con la clase
    profesor.clases = [clase];
    profesor = await usuarioRepository.save(profesor);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [BonoService],
    }).compile();

    service = module.get<BonoService>(BonoService);
    bonoRepository = module.get<Repository<BonoEntity>>(
      getRepositoryToken(BonoEntity),
    );
    usuarioRepository = module.get<Repository<UsuarioEntity>>(
      getRepositoryToken(UsuarioEntity),
    );
    claseRepository = module.get<Repository<ClaseEntity>>(
      getRepositoryToken(ClaseEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearBono', () => {
    it('debería crear un bono para un profesor y una clase válida', async () => {
      const bono = {
        usuario: profesor,
        clase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      const resultado = await service.crearBono(bono);
      expect(resultado).toHaveProperty('id');
      expect(resultado.monto).toBe(100);
      expect(resultado.calificacion).toBe(4);
      expect(resultado.palabraClave).toBe('TestClave');
      expect(resultado.usuario.id).toBe(profesor.id);
      expect(resultado.clase.id).toBe(clase.id);
    });

    it('debería lanzar excepción si el usuario no existe', async () => {
      const bono = {
        usuario: {
          id: '00000000-0000-0000-0000-000000000000',
        } as UsuarioEntity,
        clase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await expect(service.crearBono(bono)).rejects.toHaveProperty(
        'message',
        'Usuario no encontrado.',
      );
    });

    it('debería lanzar excepción si el usuario no es un Profesor', async () => {
      const estudiante = usuarioRepository.create({
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Estudiante',
      });
      await usuarioRepository.save(estudiante);

      const bono = {
        usuario: estudiante,
        clase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await expect(service.crearBono(bono)).rejects.toHaveProperty(
        'message',
        'Solo los usuarios con rol de Profesor pueden tener bonos.',
      );
    });

    it('debería lanzar excepción si la clase no existe', async () => {
      const bono = {
        usuario: profesor,
        clase: { id: '00000000-0000-0000-0000-000000000000' } as ClaseEntity,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await expect(service.crearBono(bono)).rejects.toHaveProperty(
        'message',
        'Clase no encontrada.',
      );
    });

    it('debería lanzar excepción si el profesor no está asociado a la clase', async () => {
      const otraClase = claseRepository.create({
        nombre: 'Otra Clase',
        codigo: 'XYZ9876543',
        creditos: 4,
      });
      await claseRepository.save(otraClase);

      const bono = {
        usuario: profesor,
        clase: otraClase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await expect(service.crearBono(bono)).rejects.toHaveProperty(
        'message',
        'El profesor no está asociado con esta clase.',
      );
    });
  });

  describe('findBonoByCodigo', () => {
    it('debería retornar bonos para un código de clase válido', async () => {
      const bono = {
        usuario: profesor,
        clase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await service.crearBono(bono);
      const bonos = await service.findBonoByCodigo(clase.codigo);
      expect(bonos).toHaveLength(1);
      expect(bonos[0].clase.codigo).toBe(clase.codigo);
    });

    it('debería lanzar excepción si no se encuentran bonos para el código de clase', async () => {
      await expect(
        service.findBonoByCodigo('CodigoInexistente'),
      ).rejects.toHaveProperty(
        'message',
        'No se encontraron bonos para la clase con el código especificado.',
      );
    });
  });

  describe('findAllBonosByUsuario', () => {
    it('debería retornar bonos para un usuario válido', async () => {
      const bono = {
        usuario: profesor,
        clase,
        monto: 100,
        calificacion: 4,
        palabraClave: 'TestClave',
      } as BonoEntity;

      await service.crearBono(bono);
      const bonos = await service.findAllBonosByUsuario(profesor.id);
      expect(bonos).toHaveLength(1);
    });

    it('debería lanzar excepción si el usuario no existe', async () => {
      await expect(
        service.findAllBonosByUsuario('00000000-0000-0000-0000-000000000000'),
      ).rejects.toHaveProperty('message', 'Usuario no encontrado.');
    });
  });

  describe('deleteBono', () => {
    it('debería eliminar un bono si tiene calificación menor o igual a 4', async () => {
      const bono = {
        usuario: profesor,
        clase,
        monto: 100,
        calificacion: 3,
        palabraClave: 'TestClave',
      } as BonoEntity;

      const bonoGuardado = await service.crearBono(bono);
      await service.deleteBono(bonoGuardado.id);
      const bonos = await bonoRepository.find();
      expect(bonos).toHaveLength(0);
    });

    it('debería lanzar excepción si el bono tiene calificación mayor a 4', async () => {
      const bono = {
        usuario: profesor,
        clase,
        monto: 100,
        calificacion: 5,
        palabraClave: 'TestClave',
      } as BonoEntity;

      const bonoGuardado = await service.crearBono(bono);
      await expect(service.deleteBono(bonoGuardado.id)).rejects.toHaveProperty(
        'message',
        'No se puede eliminar un bono con calificación mayor a 4.',
      );
    });

    it('debería lanzar excepción si el bono no existe', async () => {
      await expect(
        service.deleteBono('00000000-0000-0000-0000-000000000000'),
      ).rejects.toHaveProperty('message', 'Bono no encontrado.');
    });
  });
});
