import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { Factura } from './factura.entity';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Paciente, Cita])],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
