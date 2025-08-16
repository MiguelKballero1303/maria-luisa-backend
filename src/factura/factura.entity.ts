import { Entity, PrimaryColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Paciente } from '../paciente/paciente.entity';
import { Cita } from '../cita/cita.entity';

@Entity('factura')
@Index('idx_paciente_id', ['paciente'])
@Index('idx_cita_id', ['cita'])
export class Factura {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Paciente)
  paciente: Paciente;

  @ManyToOne(() => Cita)
  cita: Cita;

  @Column('decimal', { precision: 10, scale: 2 })
  montoTotal: number;

  @Column({ type: 'text', nullable: true })
  detallesServicios: string;

  @Column()
  fechaEmision: Date;

  @Column()
  estadoPago: string;

  @CreateDateColumn()
  creadoEn: Date;
}
