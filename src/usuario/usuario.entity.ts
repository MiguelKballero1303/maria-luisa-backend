import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  dni: string;

  @Column()
  celular: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @Column()
  rol: string;

  @CreateDateColumn()
  creadoEn: Date;
}
