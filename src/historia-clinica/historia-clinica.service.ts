import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaClinica } from './historia-clinica.entity';

@Injectable()
export class HistoriaClinicaService {
  constructor(
    @InjectRepository(HistoriaClinica)
    private readonly historiaRepository: Repository<HistoriaClinica>,
  ) {}

  async findAll(usuario: any): Promise<HistoriaClinica[]> {
    const { rol } = usuario;
    if (
      rol === 'Administrador General' ||
      rol === 'Encargado' ||
      rol === 'Profesional de Salud'
    ) {
      return this.historiaRepository.find({
        relations: ['paciente', 'profesionalSalud', 'tratamiento'], // <-- AÑADE ESTO
      });
    }
    throw new ForbiddenException('No tiene permisos para ver historias clínicas');
  }

  async findOneByRol(id: string, usuario: any): Promise<HistoriaClinica> {
    const historia = await this.historiaRepository.findOne({
      where: { id },
      relations: ['paciente'],
    });
    if (!historia) {
      throw new NotFoundException(`Historia con ID ${id} no encontrada`);
    }

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return historia;
    }

    throw new ForbiddenException('No tiene permisos para ver esta historia');
  }

  async create(historiaData: Partial<HistoriaClinica>, usuario: any): Promise<HistoriaClinica> {
    if (
      usuario.rol !== 'Administrador General' &&
      usuario.rol !== 'Profesional de Salud'
    ) {
      throw new ForbiddenException('No tiene permisos para crear historias clínicas');
    }

    const historia = this.historiaRepository.create({
      ...historiaData,
      id: `HIS${Math.floor(Math.random() * 9000 + 1000)}`,
    });

    return this.historiaRepository.save(historia);
  }

  async update(id: string, historiaData: Partial<HistoriaClinica>, usuario: any): Promise<HistoriaClinica> {
    if (
      usuario.rol !== 'Administrador General' &&
      usuario.rol !== 'Profesional de Salud'
    ) {
      throw new ForbiddenException('No tiene permisos para actualizar historias clínicas');
    }

    await this.historiaRepository.update(id, historiaData);
    return this.findOneByRol(id, usuario);
  }

  async delete(id: string, usuario: any): Promise<void> {
    if (usuario.rol !== 'Administrador General') {
      throw new ForbiddenException('Solo el administrador puede eliminar historias clínicas');
    }

    await this.historiaRepository.delete(id);
  }
}
