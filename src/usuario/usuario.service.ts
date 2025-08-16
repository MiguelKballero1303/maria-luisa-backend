import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
const ROLES_PERMITIDOS = [
  'Administrador General',
  'Encargado de Recepción',
  'Profesional de Salud',
];

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  async create(usuarioData: Partial<Usuario>): Promise<Usuario> {
    if (!ROLES_PERMITIDOS.includes(usuarioData.rol)) {
      throw new BadRequestException(`Rol inválido. Debe ser uno de: ${ROLES_PERMITIDOS.join(', ')}`);
    }

    const hashedPassword = await bcrypt.hash(usuarioData.password, 10); // 🔐 Encriptar

    const usuario = this.usuarioRepository.create({
      ...usuarioData,
      password: hashedPassword,
      id: randomUUID(),
    });

    return this.usuarioRepository.save(usuario);
  }

  async update(id: string, usuarioData: Partial<Usuario>): Promise<Usuario> {
    if (usuarioData.rol && !ROLES_PERMITIDOS.includes(usuarioData.rol)) {
      throw new BadRequestException(`Rol inválido. Debe ser uno de: ${ROLES_PERMITIDOS.join(', ')}`);
    }

    if (usuarioData.password) {
      usuarioData.password = await bcrypt.hash(usuarioData.password, 10);
    }

    await this.usuarioRepository.update(id, usuarioData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}