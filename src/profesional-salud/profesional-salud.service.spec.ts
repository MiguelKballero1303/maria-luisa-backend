import { Test, TestingModule } from '@nestjs/testing';
import { ProfesionalSaludService } from './profesional-salud.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfesionalSalud } from './profesional-salud.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockProfesional: ProfesionalSalud = {
  id: 'PROF1234',
  nombre: 'Carlos',
  apellido: 'Pérez',
  especialidad: 'Psicología Clínica',
  telefono: '987654321',
  correo: 'carlos.perez@example.com',
  horario: 'Lunes a Viernes 8am - 4pm',
  numeroLicencia: 'PSI789456',
  hablaQuechua: true,
  creadoEn: new Date('2024-05-01'),
};

describe('ProfesionalSaludService', () => {
  let service: ProfesionalSaludService;
  let repo: any;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfesionalSaludService,
        {
          provide: getRepositoryToken(ProfesionalSalud),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProfesionalSaludService>(ProfesionalSaludService);
    repo = module.get(getRepositoryToken(ProfesionalSalud));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debería retornar todos si el rol es válido', async () => {
      repo.find.mockResolvedValue([mockProfesional]);
      const result = await service.findAll({ rol: 'Encargado' });
      expect(result).toEqual([mockProfesional]);
    });

    it('debería lanzar ForbiddenException si rol es inválido', async () => {
      await expect(service.findAll({ rol: 'Paciente' }))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('findOneByRol', () => {
    it('debería retornar un profesional si el rol es válido', async () => {
      repo.findOne.mockResolvedValue(mockProfesional);
      const result = await service.findOneByRol('PROF1234', { rol: 'Administrador General' });
      expect(result).toEqual(mockProfesional);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(undefined);
      await expect(service.findOneByRol('PROF0000', { rol: 'Administrador General' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si rol es inválido', async () => {
      repo.findOne.mockResolvedValue(mockProfesional);
      await expect(service.findOneByRol('PROF1234', { rol: 'Paciente' }))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('debería crear un profesional con ID generado', async () => {
      repo.findOne.mockResolvedValue(undefined); // para ID único
      repo.create.mockReturnValue(mockProfesional);
      repo.save.mockResolvedValue(mockProfesional);
      const result = await service.create(mockProfesional);
      expect(result).toEqual(mockProfesional);
    });
  });

  describe('update', () => {
    it('debería actualizar y retornar el profesional', async () => {
      repo.update.mockResolvedValue(undefined);
      repo.findOne.mockResolvedValue(mockProfesional);
      const result = await service.update('PROF1234', { telefono: '123123123' });
      expect(result).toEqual(mockProfesional);
    });
  });

  describe('delete', () => {
    it('debería eliminar un profesional', async () => {
      repo.delete.mockResolvedValue(undefined);
      await expect(service.delete('PROF1234')).resolves.toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('debería retornar un profesional existente', async () => {
      repo.findOne.mockResolvedValue(mockProfesional);
      const result = await service.findOne('PROF1234');
      expect(result).toEqual(mockProfesional);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(undefined);
      await expect(service.findOne('PROF0000')).rejects.toThrow(NotFoundException);
    });
  });
});
