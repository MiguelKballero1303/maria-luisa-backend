import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const mockService = {
      obtenerResumen: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  describe('getResumen', () => {
    it('debe llamar a obtenerResumen y retornar datos', async () => {
      const resumenMock = { pacientes: 10, citas: 20, facturas: 5, interacciones: 500, citasPorDia: [] };
      jest.spyOn(service, 'obtenerResumen').mockResolvedValue(resumenMock);

      const resultado = await controller.getResumen();

      expect(service.obtenerResumen).toHaveBeenCalled();
      expect(resultado).toBe(resumenMock);
    });
  });
});
