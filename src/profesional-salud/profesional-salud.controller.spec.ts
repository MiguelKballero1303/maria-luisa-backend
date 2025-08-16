import { Test, TestingModule } from '@nestjs/testing';
import { ProfesionalSaludController } from './profesional-salud.controller';
import { ProfesionalSaludService } from './profesional-salud.service';
import { ProfesionalSalud } from './profesional-salud.entity';

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

describe('ProfesionalSaludController', () => {
  let controller: ProfesionalSaludController;
  let service: ProfesionalSaludService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockProfesional]),
    findOneByRol: jest.fn().mockResolvedValue(mockProfesional),
    create: jest.fn().mockResolvedValue(mockProfesional),
    update: jest.fn().mockResolvedValue(mockProfesional),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfesionalSaludController],
      providers: [{ provide: ProfesionalSaludService, useValue: mockService }],
    }).compile();

    controller = module.get<ProfesionalSaludController>(ProfesionalSaludController);
    service = module.get<ProfesionalSaludService>(ProfesionalSaludService);
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todos los profesionales', async () => {
    const result = await controller.findAll({ user: { rol: 'Encargado' } });
    expect(result).toEqual([mockProfesional]);
    expect(service.findAll).toHaveBeenCalledWith({ rol: 'Encargado' });
  });

  it('debería retornar un profesional por ID', async () => {
    const result = await controller.findOne('PROF1234', { user: { rol: 'Administrador General' } });
    expect(result).toEqual(mockProfesional);
    expect(service.findOneByRol).toHaveBeenCalledWith('PROF1234', { rol: 'Administrador General' });
  });

  it('debería crear un profesional', async () => {
    const result = await controller.create(mockProfesional);
    expect(result).toEqual(mockProfesional);
    expect(service.create).toHaveBeenCalledWith(mockProfesional);
  });

  it('debería actualizar un profesional', async () => {
    const result = await controller.update('PROF1234', { especialidad: 'Psicología Infantil' });
    expect(result).toEqual(mockProfesional);
    expect(service.update).toHaveBeenCalledWith('PROF1234', { especialidad: 'Psicología Infantil' });
  });

  it('debería eliminar un profesional', async () => {
    const result = await controller.delete('PROF1234');
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('PROF1234');
  });
});
