import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from './cita.entity';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity';
import * as nodemailer from 'nodemailer';

function generarIdCita(): string {
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `CIT${numero}`;
}

function generarEnlaceJitsi(citaId: string): string {
  return `https://meet.jit.si/${citaId}`;
}

@Injectable()
export class CitaService {
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
  ) {}

  async findAll(usuario: any): Promise<Cita[]> {
    const { rol } = usuario;
    if (
      rol === 'Administrador General' ||
      rol === 'Encargado' ||
      rol === 'Profesional de Salud'
    ) {
      return this.citaRepository.find({
        relations: ['paciente', 'profesionalSalud'],
      });
    }
    throw new ForbiddenException('No tiene permisos para ver citas');
  }

  async findOneByRol(id: string, usuario: any): Promise<Cita> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: ['paciente', 'profesionalSalud'],
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    if (
      usuario.rol === 'Administrador General' ||
      usuario.rol === 'Encargado' ||
      usuario.rol === 'Profesional de Salud'
    ) {
      return cita;
    }

    throw new ForbiddenException('No tiene permiso para ver esta cita');
  }

  async create(citaData: Partial<Cita>): Promise<Cita> {
    const pacienteId =
      typeof citaData.paciente === 'string'
        ? citaData.paciente
        : (citaData.paciente as Paciente)?.id;

    const profesionalId =
      typeof citaData.profesionalSalud === 'string'
        ? citaData.profesionalSalud
        : (citaData.profesionalSalud as ProfesionalSalud)?.id;

    const paciente = await this.citaRepository.manager.findOne(Paciente, {
      where: { id: pacienteId },
    });

    const profesional = await this.citaRepository.manager.findOne(
      ProfesionalSalud,
      {
        where: { id: profesionalId },
      },
    );

    if (!paciente || !profesional) {
      throw new NotFoundException('Paciente o Profesional no encontrado');
    }

    const citaId = await this.generarIdUnico();
    const enlace = generarEnlaceJitsi(citaId);

    const cita = this.citaRepository.create({
      ...citaData,
      id: citaId,
      paciente,
      profesionalSalud: profesional,
      motivo: citaData.motivo ?? `Videollamada - ${enlace}`,
    });

    const saved = await this.citaRepository.save(cita);

    // Enviar correos
    try {
      await this.enviarCorreo(paciente.correo, profesional.correo, paciente.nombre, profesional.nombre, enlace, citaData.fechaHora);
    } catch (err) {
      console.error('❌ Error enviando correos:', err);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, citaData: Partial<Cita>): Promise<Cita> {
    const pacienteId =
      typeof citaData.paciente === 'string'
        ? citaData.paciente
        : (citaData.paciente as Paciente)?.id;

    const profesionalId =
      typeof citaData.profesionalSalud === 'string'
        ? citaData.profesionalSalud
        : (citaData.profesionalSalud as ProfesionalSalud)?.id;

    const paciente = await this.citaRepository.manager.findOne(Paciente, {
      where: { id: pacienteId },
    });

    const profesional = await this.citaRepository.manager.findOne(
      ProfesionalSalud,
      {
        where: { id: profesionalId },
      },
    );

    if (!paciente || !profesional) {
      throw new NotFoundException('Paciente o Profesional no encontrado');
    }

    await this.citaRepository.update(id, {
      ...citaData,
      paciente,
      profesionalSalud: profesional,
    });

    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.citaRepository.delete(id);
  }

  async findOne(id: string): Promise<Cita> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: ['paciente', 'profesionalSalud'],
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    return cita;
  }

  private async generarIdUnico(): Promise<string> {
    let id: string;
    let existe: Cita | undefined;

    do {
      id = generarIdCita();
      existe = await this.citaRepository.findOne({ where: { id } });
    } while (existe);

    return id;
  }

  private async enviarCorreo(
    correoPaciente: string,
    correoProfesional: string,
    nombrePaciente: string,
    nombreProfesional: string,
    enlace: string,
    fechaHora: Date,
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'miguel.lynch130304@gmail.com', // 👈 Cambia esto
        pass: 'qjwy oczz gegf mguo', // 👈 O usa variables de entorno
      },
    });

    const asunto = 'Nueva cita programada';
    const fecha = new Date(fechaHora).toLocaleString('es-PE');

    const contenido = `
      <h3>¡Cita programada!</h3>
      <p><b>Fecha y hora:</b> ${fecha}</p>
      <p><b>Enlace de videollamada:</b> <a href="${enlace}" target="_blank">${enlace}</a></p>
      <p>Por favor, conéctese unos minutos antes.</p>
    `;

    const correos = [
      { to: correoPaciente, nombre: nombrePaciente },
      { to: correoProfesional, nombre: nombreProfesional },
    ];

    for (const c of correos) {
      await transporter.sendMail({
        from: '"Consultorio Psicológico" <miguel.lynch130304@gmail.com>',
        to: c.to,
        subject: asunto,
        html: `<p>Hola ${c.nombre},</p>${contenido}`,
      });
    }
  }
}
