import { Test, TestingModule } from '@nestjs/testing';
import { TratamientoService } from './tratamiento.service';
import { Tratamiento } from './tratamiento.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TratamientoService', () => {
  let service: TratamientoService;
  let repo: Repository<Tratamiento>;

  const mockTratamiento: Tratamiento = {
    id: 'TRA1234',
    nombreTratamiento: 'Terapia psicológica',
    descripcion: 'Terapia individual',
    fechaInicio: new Date('2024-06-01'),
    fechaFin: new Date('2024-08-01'),
    frecuenciaSesiones: '1 vez por semana',
    creadoEn: new Date(),
  };

  const mockRepository = {
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
        TratamientoService,
        {
          provide: getRepositoryToken(Tratamiento),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TratamientoService>(TratamientoService);
    repo = module.get<Repository<Tratamiento>>(getRepositoryToken(Tratamiento));
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todos los tratamientos (rol válido)', async () => {
    mockRepository.find.mockResolvedValue([mockTratamiento]);
    const result = await service.findAll({ rol: 'Profesional de Salud' });
    expect(result).toEqual([mockTratamiento]);
  });

  it('debería lanzar ForbiddenException si el rol no tiene acceso a findAll', async () => {
    await expect(service.findAll({ rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería retornar tratamiento por ID si rol válido', async () => {
    mockRepository.findOne.mockResolvedValue(mockTratamiento);
    const result = await service.findOneByRol('TRA1234', { rol: 'Encargado de Recepción' });
    expect(result).toEqual(mockTratamiento);
  });

  it('debería lanzar NotFoundException si no existe el tratamiento', async () => {
    mockRepository.findOne.mockResolvedValue(undefined);
    await expect(service.findOneByRol('TRA0000', { rol: 'Administrador General' }))
      .rejects.toThrow(NotFoundException);
  });

  it('debería lanzar ForbiddenException si rol no puede ver un tratamiento', async () => {
    mockRepository.findOne.mockResolvedValue(mockTratamiento);
    await expect(service.findOneByRol('TRA1234', { rol: 'Paciente' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('debería crear tratamiento si rol es válido', async () => {
    mockRepository.create.mockReturnValue(mockTratamiento);
    mockRepository.save.mockResolvedValue(mockTratamiento);
    const result = await service.create(mockTratamiento, { rol: 'Administrador General' });
    expect(result).toEqual(mockTratamiento);
  });

  it('debería lanzar ForbiddenException al crear con rol no permitido', async () => {
    await expect(service.create(mockTratamiento, { rol: 'Encargado de Recepción' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('debería actualizar tratamiento si rol válido', async () => {
    mockRepository.update.mockResolvedValue(undefined);
    mockRepository.findOne.mockResolvedValue(mockTratamiento); // para findOneByRol
    const result = await service.update('TRA1234', { descripcion: 'Actualizado' }, { rol: 'Profesional de Salud' });
    expect(result).toEqual(mockTratamiento);
  });

  it('debería lanzar ForbiddenException si rol no puede actualizar', async () => {
    await expect(service.update('TRA1234', {}, { rol: 'Paciente' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('debería eliminar tratamiento si es Administrador General', async () => {
    mockRepository.delete.mockResolvedValue(undefined);
    await expect(service.delete('TRA1234', { rol: 'Administrador General' })).resolves.toBeUndefined();
  });

  it('debería lanzar ForbiddenException al eliminar con rol inválido', async () => {
    await expect(service.delete('TRA1234', { rol: 'Profesional de Salud' }))
      .rejects.toThrow(ForbiddenException);
  });
});
