import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles('Administrador General')
  findAll(@Req() req): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @Roles('Administrador General')
  findOne(@Param('id') id: string, @Req() req): Promise<Usuario> {
    return this.usuarioService.findOne(id);
  }

  @Post()
  @Roles('Administrador General')
  create(@Body() usuarioData: Partial<Usuario>): Promise<Usuario> {
    return this.usuarioService.create(usuarioData);
  }

  @Put(':id')
  @Roles('Administrador General')
  update(@Param('id') id: string, @Body() usuarioData: Partial<Usuario>): Promise<Usuario> {
    return this.usuarioService.update(id, usuarioData);
  }

  @Delete(':id')
  @Roles('Administrador General')
  delete(@Param('id') id: string): Promise<void> {
    return this.usuarioService.delete(id);
  }
}
