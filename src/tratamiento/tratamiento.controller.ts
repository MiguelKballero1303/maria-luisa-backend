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
import { TratamientoService } from './tratamiento.service';
import { Tratamiento } from './tratamiento.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tratamientos')
export class TratamientoController {
  constructor(private readonly tratamientoService: TratamientoService) {}

  @Get()
  @Roles('Administrador General', 'Encargado de Recepción', 'Profesional de Salud')
  findAll(@Req() req): Promise<Tratamiento[]> {
    return this.tratamientoService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado de Recepción', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<Tratamiento> {
    return this.tratamientoService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Profesional de Salud')
  create(@Body() tratamientoData: Partial<Tratamiento>, @Req() req): Promise<Tratamiento> {
    return this.tratamientoService.create(tratamientoData, req.user);
  }

  @Put(':id')
  @Roles('Administrador General', 'Profesional de Salud')
  update(@Param('id') id: string, @Body() tratamientoData: Partial<Tratamiento>, @Req() req): Promise<Tratamiento> {
    return this.tratamientoService.update(id, tratamientoData, req.user);
  }

  @Delete(':id')
  @Roles('Administrador General')
  delete(@Param('id') id: string, @Req() req): Promise<void> {
    return this.tratamientoService.delete(id, req.user);
  }
}
