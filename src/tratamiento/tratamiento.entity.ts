import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tratamiento')
export class Tratamiento {
  @PrimaryColumn()
  id: string;

  @Column()
  nombreTratamiento: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  fechaInicio: Date;

  @Column({ nullable: true })
  fechaFin: Date;

  @Column()
  frecuenciaSesiones: string;

  @CreateDateColumn()
  creadoEn: Date;
}
