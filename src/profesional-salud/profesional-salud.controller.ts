import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfesionalSaludService } from './profesional-salud.service';
import { ProfesionalSalud } from './profesional-salud.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('profesionales-salud')
export class ProfesionalSaludController {
  constructor(private readonly profesionalService: ProfesionalSaludService) {}

  @Get()
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findAll(@Req() req): Promise<ProfesionalSalud[]> {
    return this.profesionalService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<ProfesionalSalud> {
    return this.profesionalService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Encargado')
  create(@Body() profesionalData: Partial<ProfesionalSalud>): Promise<ProfesionalSalud> {
    return this.profesionalService.create(profesionalData);
  }

  @Put(':id')
  @Roles('Administrador General', 'Encargado')
  update(@Param('id') id: string, @Body() profesionalData: Partial<ProfesionalSalud>): Promise<ProfesionalSalud> {
    return this.profesionalService.update(id, profesionalData);
  }

  @Delete(':id')
  @Roles('Administrador General', 'Encargado')
  delete(@Param('id') id: string): Promise<void> {
    return this.profesionalService.delete(id);
  }
}
