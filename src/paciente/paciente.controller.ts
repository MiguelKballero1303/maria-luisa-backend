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
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pacientes')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) { }

  @Get()
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findAll(@Req() req): Promise<Paciente[]> {
    return this.pacienteService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<Paciente> {
    return this.pacienteService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Encargado')
  create(@Body() pacienteData: Partial<Paciente>): Promise<Paciente> {
    return this.pacienteService.create(pacienteData);
  }

  @Put(':id')
  @Roles('Administrador General', 'Encargado')
  update(@Param('id') id: string, @Body() pacienteData: Partial<Paciente>): Promise<Paciente> {
    return this.pacienteService.update(id, pacienteData);
  }

  @Delete(':id')
  @Roles('Administrador General', 'Encargado')
  delete(@Param('id') id: string): Promise<void> {
    return this.pacienteService.delete(id);
  }
}
