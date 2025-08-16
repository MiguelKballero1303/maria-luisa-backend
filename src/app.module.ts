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
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'maria_luisa_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
