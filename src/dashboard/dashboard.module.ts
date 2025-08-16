import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';
import { Factura } from '../factura/factura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, Cita, Factura])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
