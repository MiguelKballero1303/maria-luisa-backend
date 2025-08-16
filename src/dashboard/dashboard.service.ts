import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';
import { Factura } from '../factura/factura.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Paciente) private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Cita) private readonly citaRepo: Repository<Cita>,
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>
  ) {}

  async obtenerResumen() {
    const [pacientes, citas, facturas] = await Promise.all([
      this.pacienteRepo.count(),
      this.citaRepo.count(),
      this.facturaRepo.count({ where: { estadoPago: 'Pendiente' } }),
    ]);

    const citasPorDia = await this.citaRepo.query(`
      SELECT TO_CHAR("fechaHora", 'Dy') AS dia, COUNT(*) AS total
      FROM cita
      WHERE "fechaHora" >= NOW() - INTERVAL '7 days'
      GROUP BY dia
      ORDER BY MIN("fechaHora")
    `);

    return {
      pacientes,
      citas,
      facturas,
      interacciones: 500,
      citasPorDia: citasPorDia.map((c: any) => ({
        dia: c.dia,
        total: parseInt(c.total),
      })),
    };
  }
}
