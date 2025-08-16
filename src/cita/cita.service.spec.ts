import { Test, TestingModule } from '@nestjs/testing';
import { CitaService } from './cita.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from './cita.entity';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CitaService', () => {
  let service: CitaService;
  let repo: Repository<Cita>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitaService,
        {
          provide: getRepositoryToken(Cita),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CitaService>(CitaService);
    repo = module.get<Repository<Cita>>(getRepositoryToken(Cita));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe retornar todas las citas si rol permitido', async () => {
      const citasMock = [{ id: 'CIT001' }, { id: 'CIT002' }];
      mockRepository.find.mockResolvedValue(citasMock);

      const result = await service.findAll({ rol: 'Administrador General' });

      expect(result).toBe(citasMock);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['paciente', 'profesionalSalud'],
      });
    });

    it('debe lanzar ForbiddenException si rol no permitido', async () => {
      await expect(service.findAll({ rol: 'Invitado' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOneByRol', () => {
    it('debe retornar cita si existe y rol permitido', async () => {
      const citaMock = { id: 'CIT001' };
      mockRepository.findOne.mockResolvedValue(citaMock);

      const result = await service.findOneByRol('CIT001', { rol: 'Encargado' });

      expect(result).toBe(citaMock);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'CIT001' },
        relations: ['paciente', 'profesionalSalud'],
      });
    });

    it('debe lanzar NotFoundException si cita no existe', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOneByRol('NO_EXISTE', { rol: 'Administrador General' })).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si rol no permitido', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'CIT001' });

      await expect(service.findOneByRol('CIT001', { rol: 'Invitado' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    const data = {
      paciente: { id: 'PAC001' } as Paciente,
      profesionalSalud: { id: 'PROF001' } as ProfesionalSalud,
      fechaHora: new Date(),
    };

    it('debe crear y retornar la cita', async () => {
      const pacienteMock = { id: 'PAC001', correo: 'p@mail.com', nombre: 'Paciente' };
      const profesionalMock = { id: 'PROF001', correo: 'pr@mail.com', nombre: 'Profesional' };
      const citaCreada = {
        ...data,
        id: 'CIT1234',
        paciente: pacienteMock,
        profesionalSalud: profesionalMock,
        motivo: expect.stringContaining('Videollamada'),
      };

      // Simulamos que no existe la ID para generarIdUnico y los findOne para paciente/profesional
      mockRepository.manager.findOne.mockResolvedValueOnce(pacienteMock);
      mockRepository.manager.findOne.mockResolvedValueOnce(profesionalMock);
      mockRepository.findOne.mockResolvedValueOnce(undefined); // para generarIdUnico

      mockRepository.create.mockReturnValue(citaCreada);
      mockRepository.save.mockResolvedValue(citaCreada);
      mockRepository.findOne.mockResolvedValue(citaCreada); // Para findOne al final

      const result = await service.create(data);

      expect(result).toEqual(citaCreada);
      expect(mockRepository.manager.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledWith(citaCreada);
    });

    it('debe lanzar NotFoundException si paciente o profesional no existe', async () => {
      mockRepository.manager.findOne.mockResolvedValueOnce(null);
      mockRepository.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(data)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const id = 'CIT9999';
    const data = {
      paciente: { id: 'PAC001' } as Paciente,
      profesionalSalud: { id: 'PROF001' } as ProfesionalSalud,
      motivo: 'Actualización motivo',
    };

    it('debe actualizar y retornar la cita', async () => {
      const pacienteMock = { id: 'PAC001' };
      const profesionalMock = { id: 'PROF001' };
      const citaMock = { id, ...data };

      mockRepository.manager.findOne.mockResolvedValueOnce(pacienteMock);
      mockRepository.manager.findOne.mockResolvedValueOnce(profesionalMock);
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOne.mockResolvedValue(citaMock);

      const result = await service.update(id, data);

      expect(mockRepository.manager.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(id, expect.objectContaining({
        paciente: pacienteMock,
        profesionalSalud: profesionalMock,
      }));
      expect(result).toEqual(citaMock);
    });

    it('debe lanzar NotFoundException si paciente o profesional no existe', async () => {
      mockRepository.manager.findOne.mockResolvedValueOnce(null);
      mockRepository.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.update(id, data)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('debe eliminar la cita', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('CIT001');

      expect(mockRepository.delete).toHaveBeenCalledWith('CIT001');
    });
  });

  describe('findOne', () => {
    it('debe retornar la cita si existe', async () => {
      const citaMock = { id: 'CIT001' };
      mockRepository.findOne.mockResolvedValue(citaMock);

      const result = await service.findOne('CIT001');

      expect(result).toBe(citaMock);
    });

    it('debe lanzar NotFoundException si no existe la cita', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne('NO_EXISTE')).rejects.toThrow(NotFoundException);
    });
  });
});
