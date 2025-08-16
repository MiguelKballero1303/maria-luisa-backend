import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinica } from './historia-clinica.entity';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity';
import { Tratamiento } from '../tratamiento/tratamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriaClinica, Paciente, ProfesionalSalud, Tratamiento])],
  controllers: [HistoriaClinicaController],
  providers: [HistoriaClinicaService],
})
export class HistoriaClinicaModule {}
