import { Test, TestingModule } from '@nestjs/testing';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente.entity';

const mockPaciente: Partial<Paciente> = {
  id: 'PAC1234',
  nombre: 'Lucía',
  apellido: 'Ramírez',
  dni: '12345678',
  celular: '987654321',
  correo: 'lucia.ramirez@example.com',
  creadoEn: new Date('2023-01-01'),
};

describe('PacienteController', () => {
  let controller: PacienteController;
  let service: PacienteService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockPaciente]),
    findOneByRol: jest.fn().mockResolvedValue(mockPaciente),
    create: jest.fn().mockResolvedValue(mockPaciente),
    update: jest.fn().mockResolvedValue(mockPaciente),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacienteController],
      providers: [{ provide: PacienteService, useValue: mockService }],
    }).compile();

    controller = module.get<PacienteController>(PacienteController);
    service = module.get<PacienteService>(PacienteService);
  });

  it('debería retornar todos los pacientes', async () => {
    const result = await controller.findAll({ user: { rol: 'Encargado' } });
    expect(result).toEqual([mockPaciente]);
    expect(service.findAll).toHaveBeenCalledWith({ rol: 'Encargado' });
  });

  it('debería retornar un paciente por ID', async () => {
    const result = await controller.findOne('PAC1234', { user: { rol: 'Profesional de Salud' } });
    expect(result).toEqual(mockPaciente);
    expect(service.findOneByRol).toHaveBeenCalledWith('PAC1234', { rol: 'Profesional de Salud' });
  });

  it('debería crear un paciente', async () => {
    const result = await controller.create(mockPaciente);
    expect(result).toEqual(mockPaciente);
    expect(service.create).toHaveBeenCalledWith(mockPaciente);
  });

  it('debería actualizar un paciente', async () => {
    const result = await controller.update('PAC1234', mockPaciente);
    expect(result).toEqual(mockPaciente);
    expect(service.update).toHaveBeenCalledWith('PAC1234', mockPaciente);
  });

  it('debería eliminar un paciente', async () => {
    const result = await controller.delete('PAC1234');
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('PAC1234');
  });
});
