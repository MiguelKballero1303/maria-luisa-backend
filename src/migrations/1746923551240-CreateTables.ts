import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1746923551240 implements MigrationInterface {
    name = 'CreateTables1746923551240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "paciente" (
            "id" character varying NOT NULL,
            "nombre" character varying NOT NULL,
            "apellido" character varying NOT NULL,
            "dni" character varying NOT NULL,
            "celular" character varying NOT NULL,
            "correo" character varying NOT NULL,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_2d35986235fcf4668f525528a98" UNIQUE ("dni"),
            CONSTRAINT "PK_cbcb7985432e4b49d32c5243867" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "profesional_salud" (
            "id" character varying NOT NULL,
            "nombre" character varying NOT NULL,
            "apellido" character varying NOT NULL,
            "especialidad" character varying NOT NULL,
            "telefono" character varying NOT NULL,
            "correo" character varying NOT NULL,
            "horario" character varying NOT NULL,
            "numeroLicencia" character varying NOT NULL,
            "hablaQuechua" boolean NOT NULL DEFAULT false,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_ea4c46eb450c21003c57f1a5a14" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TYPE "public"."cita_estado_enum" AS ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA')`);

        await queryRunner.query(`CREATE TABLE "cita" (
            "id" character varying NOT NULL,
            "fechaHora" TIMESTAMP NOT NULL,
            "motivo" character varying,
            "estado" "public"."cita_estado_enum" NOT NULL DEFAULT 'PENDIENTE',
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            "pacienteId" character varying,
            "profesionalSaludId" character varying,
            CONSTRAINT "PK_57e1373661f0c185987b03dc6c8" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "idx_fecha_hora" ON "cita" ("fechaHora")`);
        await queryRunner.query(`CREATE INDEX "idx_paciente_id_cita" ON "cita" ("pacienteId")`);

        await queryRunner.query(`CREATE TABLE "factura" (
            "id" character varying NOT NULL,
            "montoTotal" numeric(10,2) NOT NULL,
            "detallesServicios" text,
            "fechaEmision" TIMESTAMP NOT NULL,
            "estadoPago" character varying NOT NULL,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            "pacienteId" character varying,
            "citaId" character varying,
            CONSTRAINT "PK_ca804984009ea42a7b46adb9a86" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "idx_cita_id" ON "factura" ("citaId")`);

        await queryRunner.query(`CREATE TABLE "tratamiento" (
            "id" character varying NOT NULL,
            "nombreTratamiento" character varying NOT NULL,
            "descripcion" character varying,
            "fechaInicio" TIMESTAMP NOT NULL,
            "fechaFin" TIMESTAMP,
            "frecuenciaSesiones" character varying NOT NULL,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_7c6936278ad5166b0e48f18a7b1" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "historia_clinica" (
            "id" character varying NOT NULL,
            "fechaCreacion" TIMESTAMP NOT NULL,
            "notasProfesional" text NOT NULL,
            "diagnostico" text,
            "observaciones" text,
            "planSeguimiento" text,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            "pacienteId" character varying,
            "profesionalSaludId" character varying,
            "tratamientoId" character varying,
            CONSTRAINT "PK_26d309dfdc36c27c162ba4ec628" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "idx_paciente_id_historia_clinica" ON "historia_clinica" ("pacienteId")`);

        await queryRunner.query(`CREATE TABLE "usuario" (
            "id" character varying NOT NULL,
            "nombre" character varying NOT NULL,
            "apellido" character varying NOT NULL,
            "dni" character varying NOT NULL,
            "celular" character varying NOT NULL,
            "email" character varying NOT NULL,
            "password" character varying NOT NULL,
            "username" character varying NOT NULL,
            "rol" character varying NOT NULL,
            "creadoEn" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_d88d01a9aaf85b32b985061d369" UNIQUE ("dni"),
            CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"),
            CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id")
        )`);


        await queryRunner.query(`ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_paciente" FOREIGN KEY ("pacienteId") REFERENCES "paciente"("id")`);
        await queryRunner.query(`ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_profesional" FOREIGN KEY ("profesionalSaludId") REFERENCES "profesional_salud"("id")`);
        await queryRunner.query(`ALTER TABLE "factura" ADD CONSTRAINT "FK_factura_paciente" FOREIGN KEY ("pacienteId") REFERENCES "paciente"("id")`);
        await queryRunner.query(`ALTER TABLE "factura" ADD CONSTRAINT "FK_factura_cita" FOREIGN KEY ("citaId") REFERENCES "cita"("id")`);
        await queryRunner.query(`ALTER TABLE "historia_clinica" ADD CONSTRAINT "FK_historia_paciente" FOREIGN KEY ("pacienteId") REFERENCES "paciente"("id")`);
        await queryRunner.query(`ALTER TABLE "historia_clinica" ADD CONSTRAINT "FK_historia_profesional" FOREIGN KEY ("profesionalSaludId") REFERENCES "profesional_salud"("id")`);
        await queryRunner.query(`ALTER TABLE "historia_clinica" ADD CONSTRAINT "FK_historia_tratamiento" FOREIGN KEY ("tratamientoId") REFERENCES "tratamiento"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historia_clinica" DROP CONSTRAINT "FK_historia_tratamiento"`);
        await queryRunner.query(`ALTER TABLE "historia_clinica" DROP CONSTRAINT "FK_historia_profesional"`);
        await queryRunner.query(`ALTER TABLE "historia_clinica" DROP CONSTRAINT "FK_historia_paciente"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP CONSTRAINT "FK_factura_cita"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP CONSTRAINT "FK_factura_paciente"`);
        await queryRunner.query(`ALTER TABLE "cita" DROP CONSTRAINT "FK_cita_profesional"`);
        await queryRunner.query(`ALTER TABLE "cita" DROP CONSTRAINT "FK_cita_paciente"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_paciente_id_historia_clinica"`);
        await queryRunner.query(`DROP TABLE "historia_clinica"`);
        await queryRunner.query(`DROP TABLE "tratamiento"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_cita_id"`);
        await queryRunner.query(`DROP TABLE "factura"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_paciente_id_cita"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_fecha_hora"`);
        await queryRunner.query(`DROP TABLE "cita"`);
        await queryRunner.query(`DROP TYPE "public"."cita_estado_enum"`);
        await queryRunner.query(`DROP TABLE "profesional_salud"`);
        await queryRunner.query(`DROP TABLE "paciente"`);
    }
}
