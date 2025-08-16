import { Test, TestingModule } from '@nestjs/testing';
import { FacturaController } from './factura.controller';
import { FacturaService } from './factura.service';
import { Factura } from './factura.entity';
import { Response } from 'express';
import { Writable } from 'stream';

const mockFactura: Partial<Factura> = {
  id: 'FAC1234',
  fechaEmision: new Date(),
  estadoPago: 'Pagado',
  detallesServicios: 'Consulta psicológica',
  montoTotal: 150,
  paciente: { nombre: 'Juan', apellido: 'Perez', dni: '12345678' } as any,
  cita: {
    fechaHora: new Date(),
    profesionalSalud: { nombre: 'Dra.', apellido: 'Ramirez' } as any,
  } as any,
};

describe('FacturaController', () => {
  let controller: FacturaController;
  let service: FacturaService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockFactura]),
    findOneByRol: jest.fn().mockResolvedValue(mockFactura),
    create: jest.fn().mockResolvedValue(mockFactura),
    update: jest.fn().mockResolvedValue(mockFactura),
    delete: jest.fn().mockResolvedValue(undefined),
    findOneWithRelations: jest.fn().mockResolvedValue(mockFactura),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturaController],
      providers: [{ provide: FacturaService, useValue: mockService }],
    }).compile();

    controller = module.get<FacturaController>(FacturaController);
    service = module.get<FacturaService>(FacturaService);
  });

  it('debería retornar todas las facturas', async () => {
    const result = await controller.findAll({ user: { rol: 'Administrador General' } });
    expect(result).toEqual([mockFactura]);
    expect(service.findAll).toHaveBeenCalledWith({ rol: 'Administrador General' });
  });

  it('debería retornar una factura por ID', async () => {
    const result = await controller.findOne('FAC1234', { user: { rol: 'Encargado' } });
    expect(result).toEqual(mockFactura);
    expect(service.findOneByRol).toHaveBeenCalledWith('FAC1234', { rol: 'Encargado' });
  });

  it('debería crear una factura', async () => {
    const result = await controller.create(mockFactura);
    expect(result).toEqual(mockFactura);
    expect(service.create).toHaveBeenCalledWith(mockFactura);
  });

  it('debería actualizar una factura', async () => {
    const result = await controller.update('FAC1234', mockFactura);
    expect(result).toEqual(mockFactura);
    expect(service.update).toHaveBeenCalledWith('FAC1234', mockFactura);
  });

  it('debería eliminar una factura', async () => {
    const result = await controller.delete('FAC1234');
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('FAC1234');
  });

  it('debería generar un PDF de factura', async () => {
    // Simula un stream válido
    const writableStream = new Writable();
    const chunks: any[] = [];
    writableStream._write = (chunk, encoding, callback) => {
      chunks.push(chunk);
      callback();
    };

    const res = Object.assign(writableStream, {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    }) as unknown as Response;

    const req = { user: { rol: 'Profesional de Salud' } };

    await controller.descargarFacturaPDF('FAC1234', res, req);

    expect(service.findOneWithRelations).toHaveBeenCalledWith('FAC1234');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'inline; filename=factura_FAC1234.pdf'
    );
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
  });
});
