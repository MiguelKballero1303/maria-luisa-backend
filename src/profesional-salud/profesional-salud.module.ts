import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesionalSaludService } from './profesional-salud.service';
import { ProfesionalSaludController } from './profesional-salud.controller';
import { ProfesionalSalud } from './profesional-salud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfesionalSalud])],
  controllers: [ProfesionalSaludController],
  providers: [ProfesionalSaludService],
})
export class ProfesionalSaludModule {}