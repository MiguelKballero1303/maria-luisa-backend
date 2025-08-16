import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteModule } from './paciente/paciente.module';
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module';
import { ProfesionalSaludModule } from './profesional-salud/profesional-salud.module';
import { TratamientoModule } from './tratamiento/tratamiento.module';
import { FacturaModule } from './factura/factura.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CitaModule } from './cita/cita.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Render y local .env
      autoLoadEntities: true,        // carga entidades automáticamente
      synchronize: false,            // true solo en desarrollo
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    }),
    PacienteModule,
    HistoriaClinicaModule,
    ProfesionalSaludModule,
    TratamientoModule,
    FacturaModule,
    UsuarioModule,
    CitaModule,
    AuthModule,
    DashboardModule,
  ],
})
export class AppModule {}
