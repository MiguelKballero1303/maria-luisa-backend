import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'mi_clave_secreta',
    });
  }

  async validate(payload: any) {
    return {
      email: payload.email,
      rol: payload.rol,   
      sub: payload.sub, 
      nombre: payload.nombre 
    };
  }
}
