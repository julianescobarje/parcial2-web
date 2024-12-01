import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { UsuarioEntity } from './usuario.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { BonoEntity } from '../bono/bono.entity';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<UsuarioEntity>;
  let bonoRepository: Repository<BonoEntity>;
  let usuarios: UsuarioEntity[];

  const seedDatabase = async () => {
    repository.clear();
    usuarios = [];
    for (let i = 0; i < 5; i++) {
      const usuario = repository.create({
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: i % 2 === 0 ? 'Profesor' : 'Decana',
      });
      usuarios.push(await repository.save(usuario));
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [UsuarioService],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<Repository<UsuarioEntity>>(
      getRepositoryToken(UsuarioEntity),
    );
    bonoRepository = module.get<Repository<BonoEntity>>(
      getRepositoryToken(BonoEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearUsuario', () => {
    it('debería crear un usuario con rol de Decana', async () => {
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Decana',
      } as UsuarioEntity;

      const resultado = await service.crearUsuario(usuario);
      expect(resultado).toHaveProperty('id');
      expect(resultado.rol).toBe('Decana');
    });

    it('debería crear un Profesor con un jefe de rol Decana', async () => {
      const decana = usuarios.find((u) => u.rol === 'Decana');
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Profesor',
        jefe: decana,
      } as UsuarioEntity;

      const resultado = await service.crearUsuario(usuario);
      expect(resultado).toHaveProperty('id');
      expect(resultado.rol).toBe('Profesor');
      expect(resultado.jefe).toBeDefined();
      expect(resultado.jefe.id).toBe(decana.id);
    });

    it('debería lanzar excepción si se intenta crear un Profesor con un jefe que no existe', async () => {
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Profesor',
        jefe: { id: '00000000-0000-0000-0000-000000000000' } as UsuarioEntity,
      } as UsuarioEntity;

      await expect(service.crearUsuario(usuario)).rejects.toHaveProperty(
        'message',
        'El jefe con el ID proporcionado no existe.',
      );
    });

    it('debería lanzar excepción si el rol no es válido', async () => {
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'TICSW',
        extension: 12345678,
        rol: 'Estudiante',
      } as UsuarioEntity;

      await expect(service.crearUsuario(usuario)).rejects.toHaveProperty(
        'message',
        'El rol debe ser uno de los siguientes: Profesor, Decana.',
      );
    });

    it('debería lanzar excepción si el grupo de investigación es inválido para un Profesor', async () => {
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: 'GRUPO_INVALIDO',
        extension: null,
        rol: 'Profesor',
      } as UsuarioEntity;

      await expect(service.crearUsuario(usuario)).rejects.toHaveProperty(
        'message',
        'El grupo de investigación debe ser TICSW, IMAGINE o COMIT.',
      );
    });

    it('debería lanzar excepción si la extensión no tiene 8 dígitos para Decanas', async () => {
      const usuario = {
        cedula: faker.number.int({ min: 10000000, max: 99999999 }),
        nombre: faker.person.fullName(),
        grupoInvestigacion: null,
        extension: 12345,
        rol: 'Decana',
      } as UsuarioEntity;

      await expect(service.crearUsuario(usuario)).rejects.toHaveProperty(
        'message',
        'El número de extensión debe tener 8 dígitos para Decanas.',
      );
    });
  });

  describe('findUsuarioById', () => {
    it('debería retornar un usuario por ID', async () => {
      const usuario = usuarios[0];
      const resultado = await service.findUsuarioById(usuario.id);
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(usuario.id);
    });

    it('debería lanzar excepción si el usuario no existe', async () => {
      const idInvalido = '00000000-0000-0000-0000-000000000000';
      await expect(service.findUsuarioById(idInvalido)).rejects.toHaveProperty(
        'message',
        'Usuario no encontrado.',
      );
    });
  });

  describe('eliminarUsuario', () => {
    it('debería eliminar un usuario válido', async () => {
      const usuario = usuarios.find((u) => u.rol === 'Profesor');
      await service.eliminarUsuario(usuario.id);
      const usuarioEliminado = await repository.findOne({
        where: { id: usuario.id },
      });
      expect(usuarioEliminado).toBeNull();
    });

    it('debería lanzar excepción si el usuario tiene rol de Decana', async () => {
      const usuario = usuarios.find((u) => u.rol === 'Decana');
      await expect(service.eliminarUsuario(usuario.id)).rejects.toHaveProperty(
        'message',
        'No se puede eliminar un usuario con rol de Decana.',
      );
    });

    it('debería lanzar excepción si el usuario tiene bonos asociados', async () => {
      const usuario = usuarios.find((u) => u.rol === 'Profesor');
      const bono = {
        id: faker.string.uuid(),
        monto: 100000,
        calificacion: 4.5,
        palabraClave: 'Bono de prueba',
        usuario,
      } as BonoEntity;

      await bonoRepository.save(bono);

      usuario.bonos = [bono];

      await repository.save(usuario);

      await expect(service.eliminarUsuario(usuario.id)).rejects.toHaveProperty(
        'message',
        'No se puede eliminar un usuario con bonos asociados.',
      );
    });

    it('debería lanzar excepción si el usuario no existe', async () => {
      const idInvalido = '00000000-0000-0000-0000-000000000000';
      await expect(service.eliminarUsuario(idInvalido)).rejects.toHaveProperty(
        'message',
        'Usuario no encontrado.',
      );
    });
  });
});
