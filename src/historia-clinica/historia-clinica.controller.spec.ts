import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinica } from './historia-clinica.entity';
import { Response } from 'express';
import { PassThrough } from 'stream';

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

describe('HistoriaClinicaController', () => {
    let controller: HistoriaClinicaController;
    let service: HistoriaClinicaService;

    const mockService = {
        findAll: jest.fn().mockResolvedValue([mockHistoria]),
        findOneByRol: jest.fn().mockResolvedValue(mockHistoria),
        create: jest.fn().mockResolvedValue(mockHistoria),
        update: jest.fn().mockResolvedValue(mockHistoria),
        delete: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoriaClinicaController],
            providers: [{ provide: HistoriaClinicaService, useValue: mockService }],
        }).compile();

        controller = module.get<HistoriaClinicaController>(HistoriaClinicaController);
        service = module.get<HistoriaClinicaService>(HistoriaClinicaService);
    });

    it('debería retornar todas las historias clínicas', async () => {
        const result = await controller.findAll({ user: { rol: 'Encargado' } });
        expect(result).toEqual([mockHistoria]);
        expect(service.findAll).toHaveBeenCalledWith({ rol: 'Encargado' });
    });

    it('debería retornar una historia clínica por ID', async () => {
        const result = await controller.findOne('HIS1234', { user: { rol: 'Profesional de Salud' } });
        expect(result).toEqual(mockHistoria);
        expect(service.findOneByRol).toHaveBeenCalledWith('HIS1234', { rol: 'Profesional de Salud' });
    });

    it('debería crear una historia clínica', async () => {
        const result = await controller.create(mockHistoria, { user: { rol: 'Administrador General' } });
        expect(result).toEqual(mockHistoria);
        expect(service.create).toHaveBeenCalledWith(mockHistoria, { rol: 'Administrador General' });
    });

    it('debería actualizar una historia clínica', async () => {
        const result = await controller.update('HIS1234', mockHistoria, { user: { rol: 'Administrador General' } });
        expect(result).toEqual(mockHistoria);
        expect(service.update).toHaveBeenCalledWith('HIS1234', mockHistoria, { rol: 'Administrador General' });
    });

    it('debería eliminar una historia clínica', async () => {
        const result = await controller.delete('HIS1234', { user: { rol: 'Administrador General' } });
        expect(result).toBeUndefined();
        expect(service.delete).toHaveBeenCalledWith('HIS1234', { rol: 'Administrador General' });
    });

    it('debería generar un PDF de historia clínica', async () => {
        const stream = new PassThrough();
        const chunks: any[] = [];

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
        });

        const res = Object.assign(stream, {
            setHeader: jest.fn(),
            headersSent: false,
        }) as unknown as Response;

        const req = { user: { rol: 'Profesional de Salud' } };

        await controller.descargarPDF('HIS1234', req, res);

        expect(service.findOneByRol).toHaveBeenCalledWith('HIS1234', { rol: 'Profesional de Salud' });
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename=historia_HIS1234.pdf'
        );
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });
});
