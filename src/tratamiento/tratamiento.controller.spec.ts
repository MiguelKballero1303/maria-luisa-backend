import { Test, TestingModule } from '@nestjs/testing';
import { TratamientoController } from './tratamiento.controller';
import { TratamientoService } from './tratamiento.service';
import { Tratamiento } from './tratamiento.entity';

const mockTratamiento: Tratamiento = {
  id: 'TRA1234',
  nombreTratamiento: 'Terapia Cognitiva',
  descripcion: 'Tratamiento para pacientes con ansiedad',
  fechaInicio: new Date('2024-06-01'),
  fechaFin: new Date('2024-08-01'),
  frecuenciaSesiones: '2 veces por semana',
  creadoEn: new Date('2024-05-20'),
};

describe('TratamientoController', () => {
  let controller: TratamientoController;
  let service: TratamientoService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockTratamiento]),
    findOneByRol: jest.fn().mockResolvedValue(mockTratamiento),
    create: jest.fn().mockResolvedValue(mockTratamiento),
    update: jest.fn().mockResolvedValue(mockTratamiento),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TratamientoController],
      providers: [{ provide: TratamientoService, useValue: mockService }],
    }).compile();

    controller = module.get<TratamientoController>(TratamientoController);
    service = module.get<TratamientoService>(TratamientoService);
  });

  afterEach(() => jest.clearAllMocks());

  it('debería retornar todos los tratamientos', async () => {
    const result = await controller.findAll({ user: { rol: 'Encargado de Recepción' } });
    expect(result).toEqual([mockTratamiento]);
    expect(service.findAll).toHaveBeenCalledWith({ rol: 'Encargado de Recepción' });
  });

  it('debería retornar un tratamiento por ID', async () => {
    const result = await controller.findOne('TRA1234', { user: { rol: 'Profesional de Salud' } });
    expect(result).toEqual(mockTratamiento);
    expect(service.findOneByRol).toHaveBeenCalledWith('TRA1234', { rol: 'Profesional de Salud' });
  });

  it('debería crear un tratamiento', async () => {
    const result = await controller.create(mockTratamiento, { user: { rol: 'Administrador General' } });
    expect(result).toEqual(mockTratamiento);
    expect(service.create).toHaveBeenCalledWith(mockTratamiento, { rol: 'Administrador General' });
  });

  it('debería actualizar un tratamiento', async () => {
    const result = await controller.update(
      'TRA1234',
      { descripcion: 'Actualizado' },
      { user: { rol: 'Profesional de Salud' } }
    );
    expect(result).toEqual(mockTratamiento);
    expect(service.update).toHaveBeenCalledWith('TRA1234', { descripcion: 'Actualizado' }, { rol: 'Profesional de Salud' });
  });

  it('debería eliminar un tratamiento', async () => {
    const result = await controller.delete('TRA1234', { user: { rol: 'Administrador General' } });
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('TRA1234', { rol: 'Administrador General' });
  });
});
