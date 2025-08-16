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
import { CitaService } from './cita.service';
import { Cita } from './cita.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('citas')
export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  @Get()
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findAll(@Req() req): Promise<Cita[]> {
    return this.citaService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<Cita> {
    return this.citaService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Encargado')
  create(@Body() citaData: Partial<Cita>): Promise<Cita> {
    return this.citaService.create(citaData);
  }

  @Put(':id')
  @Roles('Administrador General', 'Encargado')
  update(@Param('id') id: string, @Body() citaData: Partial<Cita>): Promise<Cita> {
    return this.citaService.update(id, citaData);
  }

  @Delete(':id')
  @Roles('Administrador General', 'Encargado')
  delete(@Param('id') id: string): Promise<void> {
    return this.citaService.delete(id);
  }
}

