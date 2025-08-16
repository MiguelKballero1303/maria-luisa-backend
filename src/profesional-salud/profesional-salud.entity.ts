import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('profesional_salud')
export class ProfesionalSalud {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  especialidad: string;

  @Column()
  telefono: string;

  @Column()
  correo: string;

  @Column()
  horario: string;

  @Column()
  numeroLicencia: string;

  @Column({ default: false })
  hablaQuechua: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
