import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repo: jest.Mocked<Repository<Usuario>>;

  const mockUsuario = {
    id: 'abc-123',
    nombre: 'Miguel',
    apellido: 'Caballero',
    username: 'miguelc',
    dni: '12345678',
    celular: '999999999',
    email: 'miguel@mail.com',
    password: 'secreto',
    rol: 'Encargado de Recepción',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repo = module.get(getRepositoryToken(Usuario));
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todos los usuarios', async () => {
    repo.find.mockResolvedValue([mockUsuario as Usuario]);
    const result = await service.findAll();
    expect(result).toEqual([mockUsuario]);
  });

  it('debería retornar un usuario por ID', async () => {
    repo.findOne.mockResolvedValue(mockUsuario as Usuario);
    const result = await service.findOne('abc-123');
    expect(result).toEqual(mockUsuario);
  });

  it('debería lanzar error si no encuentra usuario', async () => {
    repo.findOne.mockResolvedValue(undefined);
    await expect(service.findOne('abc-123')).rejects.toThrow(NotFoundException);
  });

  it('debería crear un usuario con contraseña hasheada', async () => {
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async () => 'hashed123');

    repo.create.mockImplementation((data) => data as Usuario);
    repo.save.mockImplementation(async (data) => ({ ...data, id: 'uid-1' }) as Usuario);

    const result = await service.create({ ...mockUsuario });
    expect(result.password).toBe('hashed123');
    expect(result.id).toBe('uid-1');
  });

  it('debería lanzar error si el rol no es válido al crear', async () => {
    await expect(
      service.create({ ...mockUsuario, rol: 'Invalido' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería actualizar usuario con contraseña hasheada', async () => {
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async () => 'newHash');

    repo.findOne.mockResolvedValue(mockUsuario as Usuario);
    repo.update.mockResolvedValue(undefined);

    const result = await service.update('abc-123', { password: 'nueva123' });
    expect(result).toEqual(mockUsuario);
  });

  it('debería lanzar error si el rol es inválido en update', async () => {
    await expect(
      service.update('abc-123', { rol: 'Invalido' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería eliminar un usuario', async () => {
    repo.delete.mockResolvedValue(undefined);
    await service.delete('abc-123');
    expect(repo.delete).toHaveBeenCalledWith('abc-123');
  });
});
