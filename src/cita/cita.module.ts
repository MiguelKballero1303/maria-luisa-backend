// cita.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './cita.entity';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity'; // Asegúrate del path correcto
import { CitaService } from './cita.service';
import { CitaController } from './cita.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, Paciente, ProfesionalSalud]), // 👈 Importante
  ],
  controllers: [CitaController],
  providers: [CitaService],
})
export class CitaModule {}
