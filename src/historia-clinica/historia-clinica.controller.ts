import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinica } from './historia-clinica.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as moment from 'moment';
import 'moment/locale/es';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('historias-clinicas')
export class HistoriaClinicaController {
  constructor(private readonly historiaService: HistoriaClinicaService) {}

  @Get()
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findAll(@Req() req): Promise<HistoriaClinica[]> {
    return this.historiaService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<HistoriaClinica> {
    return this.historiaService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Profesional de Salud')
  create(
    @Body() historiaData: Partial<HistoriaClinica>,
    @Req() req,
  ): Promise<HistoriaClinica> {
    return this.historiaService.create(historiaData, req.user);
  }

  @Put(':id')
  @Roles('Administrador General', 'Profesional de Salud')
  update(
    @Param('id') id: string,
    @Body() historiaData: Partial<HistoriaClinica>,
    @Req() req,
  ): Promise<HistoriaClinica> {
    return this.historiaService.update(id, historiaData, req.user);
  }

  @Delete(':id')
  @Roles('Administrador General')
  delete(@Param('id') id: string, @Req() req): Promise<void> {
    return this.historiaService.delete(id, req.user);
  }

  @Get(':id/pdf')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  async descargarPDF(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
  ): Promise<void> {
    const historia = await this.historiaService.findOneByRol(id, req.user);
    moment.locale('es');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=historia_${id}.pdf`,
    );
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);


    doc
      .fillColor('#c2185b')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Consultorio Psicológico María Luisa', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .fillColor('#333')
      .text('INFORME DE HISTORIA CLÍNICA', { align: 'center' })
      .moveDown(1.5);


    doc
      .strokeColor('#f8bbd0')
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke()
      .moveDown(0.5);


    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Código: ${historia.id}`)
      .text(`Fecha de creación: ${moment(historia.fechaCreacion).format('LL')}`)
      .text(`Paciente: ${historia.paciente?.nombre ?? ''} ${historia.paciente?.apellido ?? ''}`)
      .text(`Profesional: ${historia.profesionalSalud?.nombre ?? ''} ${historia.profesionalSalud?.apellido ?? ''}`)
      .text(`Tratamiento: ${historia.tratamiento?.nombreTratamiento ?? historia.tratamiento?.descripcion ?? 'N/A'}`)
      .moveDown();

    const seccion = (titulo: string, texto: string) => {
      if (!texto?.trim()) return;
      doc
        .fillColor('#6a1b9a')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(titulo)
        .moveDown(0.3);

      doc
        .fontSize(11)
        .fillColor('#000')
        .font('Helvetica')
        .text(texto, { align: 'justify' })
        .moveDown(1);
    };

    seccion('Diagnóstico', historia.diagnostico);
    seccion('Observaciones', historia.observaciones);
    seccion('Plan de seguimiento', historia.planSeguimiento);
    seccion('Notas del Profesional', historia.notasProfesional);


    doc
      .fontSize(10)
      .fillColor('#777')
      .text(
        `Emitido el ${moment().format('LLL')}`,
        doc.page.margins.left,
        doc.page.height - 60,
        { align: 'center' },
      );

    doc.end();

    doc.on('finish', () => {
      if (!res.headersSent) res.end();
    });
  }
}
