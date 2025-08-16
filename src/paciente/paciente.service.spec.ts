import { Test, TestingModule } from '@nestjs/testing';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';

const mockPaciente: Paciente = {
  id: 'PAC1234',
  nombre: 'Lucía',
  apellido: 'Ramírez',
  dni: '12345678',
  celular: '987654321',
  correo: 'lucia.ramirez@example.com',
  creadoEn: new Date('2023-01-01'),
};

describe('PacienteService', () => {
  let service: PacienteService;
  let repo: Repository<Paciente>;

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
        PacienteService,
        {
          provide: getRepositoryToken(Paciente),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PacienteService>(PacienteService);
    repo = module.get<Repository<Paciente>>(getRepositoryToken(Paciente));
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todos los pacientes si el rol es válido', async () => {
    mockRepo.find.mockResolvedValue([mockPaciente]);

    const result = await service.findAll({ rol: 'Encargado' });

    expect(result).toEqual([mockPaciente]);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('debería lanzar ForbiddenException si el rol no tiene acceso', async () => {
    await expect(service.findAll({ rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería retornar un paciente por ID si el rol es válido', async () => {
    mockRepo.findOne.mockResolvedValue(mockPaciente);

    const result = await service.findOneByRol('PAC1234', { rol: 'Administrador General' });

    expect(result).toEqual(mockPaciente);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'PAC1234' } });
  });

  it('debería lanzar NotFoundException si el paciente no existe', async () => {
    mockRepo.findOne.mockResolvedValue(undefined);

    await expect(service.findOneByRol('PAC0000', { rol: 'Encargado' })).rejects.toThrow(NotFoundException);
  });

  it('debería crear un paciente con ID único', async () => {
    mockRepo.findOne.mockResolvedValue(undefined); // Para que el ID no exista
    mockRepo.create.mockReturnValue(mockPaciente);
    mockRepo.save.mockResolvedValue(mockPaciente);

    const result = await service.create(mockPaciente);

    expect(result).toEqual(mockPaciente);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(String) }));
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('debería actualizar un paciente', async () => {
    mockRepo.update.mockResolvedValue(undefined);
    mockRepo.findOne.mockResolvedValue(mockPaciente);

    const result = await service.update('PAC1234', { nombre: 'Ana' });

    expect(result).toEqual(mockPaciente);
    expect(mockRepo.update).toHaveBeenCalledWith('PAC1234', { nombre: 'Ana' });
  });

  it('debería eliminar un paciente', async () => {
    mockRepo.delete.mockResolvedValue(undefined);

    await service.delete('PAC1234');

    expect(mockRepo.delete).toHaveBeenCalledWith('PAC1234');
  });

  it('debería retornar un paciente por ID en findOne', async () => {
    mockRepo.findOne.mockResolvedValue(mockPaciente);

    const result = await service.findOne('PAC1234');

    expect(result).toEqual(mockPaciente);
  });

  it('debería lanzar NotFoundException si el paciente no existe en findOne', async () => {
    mockRepo.findOne.mockResolvedValue(undefined);

    await expect(service.findOne('PAC0000')).rejects.toThrow(NotFoundException);
  });
});
