import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfesionalSalud } from './profesional-salud.entity';

@Injectable()
export class ProfesionalSaludService {
  constructor(
    @InjectRepository(ProfesionalSalud)
    private readonly profesionalRepository: Repository<ProfesionalSalud>
  ) {}

  async findAll(usuario: any): Promise<ProfesionalSalud[]> {
    const { rol } = usuario;

    if (
      rol === 'Administrador General' ||
      rol === 'Encargado' ||
      rol === 'Profesional de Salud'
    ) {
      return this.profesionalRepository.find();
    }

    throw new ForbiddenException('No tiene permisos para ver profesionales');
  }

  async findOneByRol(id: string, usuario: any): Promise<ProfesionalSalud> {
    const profesional = await this.profesionalRepository.findOne({ where: { id } });

    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return profesional;
    }

    throw new ForbiddenException('No tiene permiso para ver este profesional');
  }

  async create(profesionalData: Partial<ProfesionalSalud>): Promise<ProfesionalSalud> {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const id = `PROF${randomDigits}`;
    const profesional = this.profesionalRepository.create({
      ...profesionalData,
      id,
    });
    return this.profesionalRepository.save(profesional);
  }

  async update(id: string, profesionalData: Partial<ProfesionalSalud>): Promise<ProfesionalSalud> {
    await this.profesionalRepository.update(id, profesionalData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.profesionalRepository.delete(id);
  }

  async findOne(id: string): Promise<ProfesionalSalud> {
    const profesional = await this.profesionalRepository.findOne({ where: { id } });
    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }
    return profesional;
  }
}
