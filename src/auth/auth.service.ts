import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const nuevoUsuario = this.usuarioRepo.create({ ...dto, password: hashed });
    await this.usuarioRepo.save(nuevoUsuario);
    return { message: 'Usuario registrado correctamente' };
  }

  async login(dto: LoginDto) {
    const user = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    });
    return { access_token: token };
  }
}
