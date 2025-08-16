import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('paciente')
export class Paciente {
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

  @Column()
  correo: string;

  @CreateDateColumn()
  creadoEn: Date;
}
