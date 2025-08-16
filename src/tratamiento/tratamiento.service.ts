import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tratamiento } from './tratamiento.entity';

@Injectable()
export class TratamientoService {
  constructor(
    @InjectRepository(Tratamiento)
    private readonly tratamientoRepository: Repository<Tratamiento>,
  ) {}

  async findAll(usuario: any): Promise<Tratamiento[]> {
    const { rol } = usuario;
    if (
      rol === 'Administrador General' ||
      rol === 'Encargado de Recepción' ||
      rol === 'Profesional de Salud'
    ) {
      return this.tratamientoRepository.find();
    }
    throw new ForbiddenException('No tiene permisos para ver tratamientos');
  }

  async findOneByRol(id: string, usuario: any): Promise<Tratamiento> {
    const tratamiento = await this.tratamientoRepository.findOne({ where: { id } });
    if (!tratamiento) throw new NotFoundException(`Tratamiento con ID ${id} no encontrado`);

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado de Recepción' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return tratamiento;
    }

    throw new ForbiddenException('No tiene permisos para ver este tratamiento');
  }

  async create(tratamientoData: Partial<Tratamiento>, usuario: any): Promise<Tratamiento> {
    if (
      usuario.rol !== 'Administrador General' &&
      usuario.rol !== 'Profesional de Salud'
    ) {
      throw new ForbiddenException('No tiene permisos para crear tratamientos');
    }

    const tratamiento = this.tratamientoRepository.create({
      ...tratamientoData,
      id: `TRA${Math.floor(Math.random() * 9000 + 1000)}`,
    });
    return this.tratamientoRepository.save(tratamiento);
  }

  async update(id: string, tratamientoData: Partial<Tratamiento>, usuario: any): Promise<Tratamiento> {
    if (
      usuario.rol !== 'Administrador General' &&
      usuario.rol !== 'Profesional de Salud'
    ) {
      throw new ForbiddenException('No tiene permisos para actualizar tratamientos');
    }

    await this.tratamientoRepository.update(id, tratamientoData);
    return this.findOneByRol(id, usuario);
  }

  async delete(id: string, usuario: any): Promise<void> {
    if (usuario.rol !== 'Administrador General') {
      throw new ForbiddenException('Solo el administrador puede eliminar tratamientos');
    }

    await this.tratamientoRepository.delete(id);
  }
}
