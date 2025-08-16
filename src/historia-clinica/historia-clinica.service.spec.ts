import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaService } from './historia-clinica.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistoriaClinica } from './historia-clinica.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockHistoria: Partial<HistoriaClinica> = {
  id: 'HIS1234',
  fechaCreacion: new Date(),
  diagnostico: 'Ansiedad generalizada',
  observaciones: 'Paciente refiere insomnio',
  planSeguimiento: 'Sesiones semanales',
  notasProfesional: 'Buena disposición',
  paciente: { nombre: 'Ana', apellido: 'Lopez' } as any,
  profesionalSalud: { nombre: 'Dr.', apellido: 'Martinez' } as any,
  tratamiento: { nombreTratamiento: 'Terapia cognitivo-conductual' } as any,
};

describe('HistoriaClinicaService', () => {
  let service: HistoriaClinicaService;
  let repo: Repository<HistoriaClinica>;

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
        HistoriaClinicaService,
        {
          provide: getRepositoryToken(HistoriaClinica),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<HistoriaClinicaService>(HistoriaClinicaService);
    repo = module.get<Repository<HistoriaClinica>>(getRepositoryToken(HistoriaClinica));
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todas las historias si el rol es válido', async () => {
    mockRepo.find.mockResolvedValue([mockHistoria]);
    const result = await service.findAll({ rol: 'Encargado' });
    expect(result).toEqual([mockHistoria]);
    expect(repo.find).toHaveBeenCalledWith({ relations: ['paciente', 'profesionalSalud', 'tratamiento'] });
  });

  it('debería lanzar ForbiddenException si el rol no es válido al buscar todas', async () => {
    await expect(service.findAll({ rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería retornar una historia por ID si el rol es válido', async () => {
    mockRepo.findOne.mockResolvedValue(mockHistoria);
    const result = await service.findOneByRol('HIS1234', { rol: 'Profesional de Salud' });
    expect(result).toEqual(mockHistoria);
  });

  it('debería lanzar NotFoundException si no encuentra la historia', async () => {
    mockRepo.findOne.mockResolvedValue(undefined);
    await expect(service.findOneByRol('INVALID', { rol: 'Encargado' })).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar ForbiddenException si el rol no es válido al buscar una', async () => {
    mockRepo.findOne.mockResolvedValue(mockHistoria);
    await expect(service.findOneByRol('HIS1234', { rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería crear una historia si el rol es válido', async () => {
    mockRepo.create.mockReturnValue(mockHistoria);
    mockRepo.save.mockResolvedValue(mockHistoria);
    const result = await service.create(mockHistoria, { rol: 'Administrador General' });
    expect(result).toEqual(mockHistoria);
  });

  it('debería lanzar ForbiddenException al crear con rol inválido', async () => {
    await expect(service.create(mockHistoria, { rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería actualizar una historia si el rol es válido', async () => {
    mockRepo.update.mockResolvedValue(undefined);
    mockRepo.findOne.mockResolvedValue(mockHistoria);
    const result = await service.update('HIS1234', mockHistoria, { rol: 'Administrador General' });
    expect(result).toEqual(mockHistoria);
  });

  it('debería lanzar ForbiddenException al actualizar con rol inválido', async () => {
    await expect(service.update('HIS1234', mockHistoria, { rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería eliminar una historia si el rol es Administrador', async () => {
    const result = await service.delete('HIS1234', { rol: 'Administrador General' });
    expect(result).toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('HIS1234');
  });

  it('debería lanzar ForbiddenException al eliminar con rol inválido', async () => {
    await expect(service.delete('HIS1234', { rol: 'Encargado' })).rejects.toThrow(ForbiddenException);
  });
});
