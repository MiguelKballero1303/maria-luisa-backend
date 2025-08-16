import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';
import { Factura } from '../factura/factura.entity';
import { Repository } from 'typeorm';

describe('DashboardService', () => {
  let service: DashboardService;

  const pacienteRepoMock = { count: jest.fn() };
  const citaRepoMock = { count: jest.fn(), query: jest.fn() };
  const facturaRepoMock = { count: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Paciente), useValue: pacienteRepoMock },
        { provide: getRepositoryToken(Cita), useValue: citaRepoMock },
        { provide: getRepositoryToken(Factura), useValue: facturaRepoMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('obtenerResumen', () => {
    it('debe retornar el resumen correcto', async () => {
      pacienteRepoMock.count.mockResolvedValue(10);
      citaRepoMock.count.mockResolvedValue(20);
      facturaRepoMock.count.mockResolvedValue(5);

      citaRepoMock.query.mockResolvedValue([
        { dia: 'Mon', total: '3' },
        { dia: 'Tue', total: '4' },
      ]);

      const resultado = await service.obtenerResumen();

      expect(resultado.pacientes).toBe(10);
      expect(resultado.citas).toBe(20);
      expect(resultado.facturas).toBe(5);
      expect(resultado.interacciones).toBe(500);
      expect(resultado.citasPorDia).toEqual([
        { dia: 'Mon', total: 3 },
        { dia: 'Tue', total: 4 },
      ]);

      expect(pacienteRepoMock.count).toHaveBeenCalled();
      expect(citaRepoMock.count).toHaveBeenCalled();
      expect(facturaRepoMock.count).toHaveBeenCalledWith({ where: { estadoPago: 'Pendiente' } });
      expect(citaRepoMock.query).toHaveBeenCalled();
    });
  });
});
