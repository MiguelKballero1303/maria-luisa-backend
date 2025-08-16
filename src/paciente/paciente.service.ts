import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './paciente.entity';

function generarIdPaciente(): string {
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `PAC${numero}`;
}

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>
  ) {}

  async findAll(usuario: any): Promise<Paciente[]> {
    const { rol } = usuario;

    if (
      rol === 'Administrador General' ||
      rol === 'Encargado' ||
      rol === 'Profesional de Salud'
    ) {
      return this.pacienteRepository.find();
    }

    throw new ForbiddenException('No tiene permisos para ver pacientes');
  }

  async findOneByRol(id: string, usuario: any): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({ where: { id } });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return paciente;
    }

    throw new ForbiddenException('No tiene permiso para ver este paciente');
  }

  async create(pacienteData: Partial<Paciente>): Promise<Paciente> {
    const id = await this.generarIdUnico();

    const paciente = this.pacienteRepository.create({
      ...pacienteData,
      id,
    });

    return this.pacienteRepository.save(paciente);
  }

  async update(id: string, pacienteData: Partial<Paciente>): Promise<Paciente> {
    await this.pacienteRepository.update(id, pacienteData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.pacienteRepository.delete(id);
  }

  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({ where: { id } });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }
    return paciente;
  }

  private async generarIdUnico(): Promise<string> {
    let id: string;
    let existe: Paciente | undefined;

    do {
      id = generarIdPaciente();
      existe = await this.pacienteRepository.findOne({ where: { id } });
    } while (existe);

    return id;
  }
}
