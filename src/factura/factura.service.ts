import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './factura.entity';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,

    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
  ) {}

  async findAll(usuario: any): Promise<Factura[]> {
    const { rol } = usuario;

    if (
      rol === 'Administrador General' ||
      rol === 'Encargado' ||
      rol === 'Profesional de Salud'
    ) {
      return this.facturaRepository.find({
        relations: ['paciente', 'cita', 'cita.paciente'],
      });
    }

    throw new ForbiddenException('No tiene permisos para ver facturas');
  }

  async findOneByRol(id: string, usuario: any): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['paciente', 'cita', 'cita.paciente'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return factura;
    }

    throw new ForbiddenException('No tiene permiso para ver esta factura');
  }

  async create(facturaData: Partial<Factura>): Promise<Factura> {
    const pacienteId =
      typeof facturaData.paciente === 'string'
        ? facturaData.paciente
        : (facturaData.paciente as Paciente)?.id;

    const citaId =
      typeof facturaData.cita === 'string'
        ? facturaData.cita
        : (facturaData.cita as Cita)?.id;

    const paciente = await this.pacienteRepository.findOne({ where: { id: pacienteId } });
    const cita = await this.citaRepository.findOne({ where: { id: citaId } });

    if (!paciente || !cita) {
      throw new NotFoundException('Paciente o Cita no encontrados');
    }

    const factura = this.facturaRepository.create({
      ...facturaData,
      id: `FAC${Math.floor(Math.random() * 9000 + 1000)}`,
      paciente,
      cita,
    });

    return this.facturaRepository.save(factura);
  }

  async update(id: string, facturaData: Partial<Factura>): Promise<Factura> {
    const pacienteId =
      typeof facturaData.paciente === 'string'
        ? facturaData.paciente
        : (facturaData.paciente as Paciente)?.id;

    const citaId =
      typeof facturaData.cita === 'string'
        ? facturaData.cita
        : (facturaData.cita as Cita)?.id;

    const paciente = await this.pacienteRepository.findOne({ where: { id: pacienteId } });
    const cita = await this.citaRepository.findOne({ where: { id: citaId } });

    if (!paciente || !cita) {
      throw new NotFoundException('Paciente o Cita no encontrados');
    }

    await this.facturaRepository.update(id, {
      ...facturaData,
      paciente,
      cita,
    });

    return this.findOne(id);
  }

  async findOne(id: string): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['paciente', 'cita', 'cita.paciente'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return factura;
  }

  async delete(id: string): Promise<void> {
    await this.facturaRepository.delete(id);
  }
  async findOneWithRelations(id: string): Promise<Factura> {
    return this.facturaRepository.findOne({
      where: { id },
      relations: ['paciente', 'cita', 'cita.profesionalSalud'],
    });
  }
}
