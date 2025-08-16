import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity';

export enum EstadoCita {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}

@Entity('cita')
@Index('idx_paciente_id', ['paciente'])
@Index('idx_fecha_hora', ['fechaHora'])
export class Cita {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Paciente)
  paciente: Paciente;

  @ManyToOne(() => ProfesionalSalud)
  profesionalSalud: ProfesionalSalud;

  @Column()
  fechaHora: Date;

  @Column({ nullable: true })
  motivo: string;

  @Column({
    type: 'enum',
    enum: EstadoCita,
    default: EstadoCita.PENDIENTE,
  })
  estado: EstadoCita;

  @CreateDateColumn()
  creadoEn: Date;
}
