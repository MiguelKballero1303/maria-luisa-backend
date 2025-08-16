import { Test, TestingModule } from '@nestjs/testing';
import { FacturaService } from './factura.service';
import { Factura } from './factura.entity';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('FacturaService', () => {
  let service: FacturaService;
  let mockFacturaRepository: jest.Mocked<Repository<Factura>>;
  let mockPacienteRepository: jest.Mocked<Repository<Paciente>>;
  let mockCitaRepository: jest.Mocked<Repository<Cita>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturaService,
        {
          provide: getRepositoryToken(Factura),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Paciente),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cita),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FacturaService>(FacturaService);
    mockFacturaRepository = module.get(getRepositoryToken(Factura));
    mockPacienteRepository = module.get(getRepositoryToken(Paciente));
    mockCitaRepository = module.get(getRepositoryToken(Cita));
  });

  it('debería retornar todas las facturas si el rol tiene permiso', async () => {
    const mockFacturas = [{ id: 'FAC1234' } as Factura];
    mockFacturaRepository.find.mockResolvedValue(mockFacturas);

    const result = await service.findAll({ rol: 'Administrador General' });
    expect(result).toEqual(mockFacturas);
  });

  it('debería lanzar ForbiddenException si el rol no tiene permiso en findAll', async () => {
    await expect(service.findAll({ rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería retornar una factura válida según el rol', async () => {
    const mockFactura = { id: 'FAC1234' } as Factura;
    mockFacturaRepository.findOne.mockResolvedValue(mockFactura);

    const result = await service.findOneByRol('FAC1234', { rol: 'Encargado' });
    expect(result).toEqual(mockFactura);
  });

  it('debería lanzar NotFoundException si no se encuentra la factura en findOneByRol', async () => {
    mockFacturaRepository.findOne.mockResolvedValue(null);
    await expect(service.findOneByRol('FAKE', { rol: 'Encargado' })).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar ForbiddenException si el usuario no tiene permisos en findOneByRol', async () => {
    mockFacturaRepository.findOne.mockResolvedValue({ id: 'FAC1234' } as Factura);
    await expect(service.findOneByRol('FAC1234', { rol: 'Paciente' })).rejects.toThrow(ForbiddenException);
  });

  it('debería crear una factura correctamente', async () => {
    const facturaData = {
      paciente: { id: 'PAC01' } as Paciente,
      cita: { id: 'CIT01' } as Cita,
      estadoPago: 'Pagado',
      montoTotal: 120,
    };

    const mockPaciente = { id: 'PAC01' } as Paciente;
    const mockCita = { id: 'CIT01' } as Cita;
    const mockFactura = { ...facturaData, id: 'FAC1234', paciente: mockPaciente, cita: mockCita } as Factura;

    mockPacienteRepository.findOne.mockResolvedValue(mockPaciente);
    mockCitaRepository.findOne.mockResolvedValue(mockCita);
    mockFacturaRepository.create.mockReturnValue(mockFactura);
    mockFacturaRepository.save.mockResolvedValue(mockFactura);

    const result = await service.create(facturaData);
    expect(result).toEqual(mockFactura);
  });

  it('debería lanzar NotFoundException si paciente o cita no existen al crear', async () => {
    mockPacienteRepository.findOne.mockResolvedValue(null);
    mockCitaRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        paciente: { id: 'no' } as Paciente,
        cita: { id: 'no' } as Cita,
      })
    ).rejects.toThrow(NotFoundException);
  });

  it('debería eliminar una factura', async () => {
    mockFacturaRepository.delete.mockResolvedValue(undefined);
    await expect(service.delete('FAC1234')).resolves.toBeUndefined();
    expect(mockFacturaRepository.delete).toHaveBeenCalledWith('FAC1234');
  });

  it('debería retornar una factura con relaciones en findOneWithRelations', async () => {
    const mockFactura = { id: 'FAC1234' } as Factura;
    mockFacturaRepository.findOne.mockResolvedValue(mockFactura);

    const result = await service.findOneWithRelations('FAC1234');
    expect(result).toEqual(mockFactura);
  });
});
