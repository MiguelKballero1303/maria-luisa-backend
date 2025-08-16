import { Entity, PrimaryColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Paciente } from '../paciente/paciente.entity';
import { ProfesionalSalud } from '../profesional-salud/profesional-salud.entity';
import { Tratamiento } from '../tratamiento/tratamiento.entity';

@Entity('historia_clinica')
@Index('idx_paciente_id', ['paciente'])
export class HistoriaClinica {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Paciente)
  paciente: Paciente;

  @ManyToOne(() => ProfesionalSalud)
  profesionalSalud: ProfesionalSalud;

  @ManyToOne(() => Tratamiento)
  tratamiento: Tratamiento;

  @Column()
  fechaCreacion: Date;

  @Column({ type: 'text' })
  notasProfesional: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  planSeguimiento: string;

  @CreateDateColumn()
  creadoEn: Date;
}
