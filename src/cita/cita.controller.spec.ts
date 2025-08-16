import { Test, TestingModule } from '@nestjs/testing';
import { CitaController } from './cita.controller';
import { CitaService } from './cita.service';
import { Cita } from './cita.entity';

describe('CitaController', () => {
  let controller: CitaController;
  let service: CitaService;

  const mockCitaService = {
    findAll: jest.fn(),
    findOneByRol: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitaController],
      providers: [
        {
          provide: CitaService,
          useValue: mockCitaService,
        },
      ],
    }).compile();

    controller = module.get<CitaController>(CitaController);
    service = module.get<CitaService>(CitaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería llamar a service.findAll con usuario', async () => {
      const usuario = { rol: 'Administrador General' };
      mockCitaService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({ user: usuario });

      expect(mockCitaService.findAll).toHaveBeenCalledWith(usuario);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería llamar a service.findOneByRol con id y usuario', async () => {
      const usuario = { rol: 'Administrador General' };
      const id = 'CIT1234';
      const cita = { id } as Cita;
      mockCitaService.findOneByRol.mockResolvedValue(cita);

      const result = await controller.findOne(id, { user: usuario });

      expect(mockCitaService.findOneByRol).toHaveBeenCalledWith(id, usuario);
      expect(result).toEqual(cita);
    });
  });

  describe('create', () => {
    it('debería llamar a service.create con datos de cita', async () => {
      const citaData = { fechaHora: new Date() };
      const citaCreada = { id: 'CIT1234', ...citaData } as Cita;
      mockCitaService.create.mockResolvedValue(citaCreada);

      const result = await controller.create(citaData);

      expect(mockCitaService.create).toHaveBeenCalledWith(citaData);
      expect(result).toEqual(citaCreada);
    });
  });

  describe('update', () => {
    it('debería llamar a service.update con id y datos', async () => {
      const id = 'CIT1234';
      const citaData = { motivo: 'Actualizado' };
      const citaActualizada = { id, ...citaData } as Cita;
      mockCitaService.update.mockResolvedValue(citaActualizada);

      const result = await controller.update(id, citaData);

      expect(mockCitaService.update).toHaveBeenCalledWith(id, citaData);
      expect(result).toEqual(citaActualizada);
    });
  });

  describe('delete', () => {
    it('debería llamar a service.delete con id', async () => {
      const id = 'CIT1234';
      mockCitaService.delete.mockResolvedValue(undefined);

      await controller.delete(id);

      expect(mockCitaService.delete).toHaveBeenCalledWith(id);
    });
  });
});
