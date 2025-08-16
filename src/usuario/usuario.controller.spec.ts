import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';

const mockUsuario: Usuario = {
  id: 'USR1234',
  nombre: 'Carlos',
  apellido: 'Gomez',
  dni: '12345678',
  celular: '987654321',
  email: 'carlos@example.com',
  password: 'hashedpassword',
  username: 'carlosg',
  rol: 'Administrador General',
  creadoEn: new Date(),
};

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: UsuarioService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockUsuario]),
    findOne: jest.fn().mockResolvedValue(mockUsuario),
    create: jest.fn().mockResolvedValue(mockUsuario),
    update: jest.fn().mockResolvedValue(mockUsuario),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: mockService }],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('debería retornar todos los usuarios', async () => {
    const result = await controller.findAll({ user: { rol: 'Administrador General' } });
    expect(result).toEqual([mockUsuario]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('debería retornar un usuario por ID', async () => {
    const result = await controller.findOne('USR1234', { user: { rol: 'Administrador General' } });
    expect(result).toEqual(mockUsuario);
    expect(service.findOne).toHaveBeenCalledWith('USR1234');
  });

  it('debería crear un nuevo usuario', async () => {
    const result = await controller.create(mockUsuario);
    expect(result).toEqual(mockUsuario);
    expect(service.create).toHaveBeenCalledWith(mockUsuario);
  });

  it('debería actualizar un usuario', async () => {
    const result = await controller.update('USR1234', mockUsuario);
    expect(result).toEqual(mockUsuario);
    expect(service.update).toHaveBeenCalledWith('USR1234', mockUsuario);
  });

  it('debería eliminar un usuario', async () => {
    const result = await controller.delete('USR1234');
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('USR1234');
  });
});
