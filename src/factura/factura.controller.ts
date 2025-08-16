import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { Factura } from './factura.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as moment from 'moment';
import 'moment/locale/es';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Get()
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findAll(@Req() req): Promise<Factura[]> {
    return this.facturaService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  findOne(@Param('id') id: string, @Req() req): Promise<Factura> {
    return this.facturaService.findOneByRol(id, req.user);
  }

  @Post()
  @Roles('Administrador General', 'Encargado')
  create(@Body() facturaData: Partial<Factura>): Promise<Factura> {
    return this.facturaService.create(facturaData);
  }

  @Put(':id')
  @Roles('Administrador General', 'Encargado')
  update(@Param('id') id: string, @Body() facturaData: Partial<Factura>): Promise<Factura> {
    return this.facturaService.update(id, facturaData);
  }

  @Delete(':id')
  @Roles('Administrador General', 'Encargado')
  delete(@Param('id') id: string): Promise<void> {
    return this.facturaService.delete(id);
  }

  @Get(':id/pdf')
  @Roles('Administrador General', 'Encargado', 'Profesional de Salud')
  async descargarFacturaPDF(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req
  ): Promise<void> {
    try {
      const factura = await this.facturaService.findOneWithRelations(id);
      moment.locale('es');

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Disposition', `inline; filename=factura_${id}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      // Encabezado
      doc
        .fontSize(18)
        .fillColor('#0d47a1')
        .font('Helvetica-Bold')
        .text('CONSULTORIO PSICOLÓGICO MARÍA LUISA', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(14)
        .fillColor('#333')
        .font('Helvetica-Bold')
        .text('FACTURA ELECTRÓNICA', { align: 'center' })
        .moveDown(1);

      // Datos generales
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#000')
        .text(`Código de factura: ${factura.id}`)
        .text(`Fecha de emisión: ${moment(factura.fechaEmision).format('LL')}`)
        .text(`Estado de pago: ${factura.estadoPago}`)
        .moveDown();

      doc
        .text(`Paciente: ${factura.paciente?.nombre ?? ''} ${factura.paciente?.apellido ?? ''}`)
        .text(`DNI: ${factura.paciente?.dni ?? '---'}`)
        .text(`Profesional: ${factura.cita?.profesionalSalud?.nombre ?? ''} ${factura.cita?.profesionalSalud?.apellido ?? ''}`)
        .text(`Fecha de cita: ${moment(factura.cita?.fechaHora).format('LL')}`)
        .moveDown();

      // Detalles del servicio
      doc
        .font('Helvetica-Bold')
        .fillColor('#1b5e20')
        .text('Detalle de servicios:', { underline: true })
        .moveDown(0.5);

      doc
        .font('Helvetica')
        .fillColor('#000')
        .text(factura.detallesServicios || 'No especificado')
        .moveDown();

      // Monto total con conversión segura a número
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#000')
        .text(`Monto Total: S/ ${Number(factura.montoTotal).toFixed(2)}`, { align: 'right' })
        .moveDown(2);

      // Pie de página
      doc
        .fontSize(10)
        .fillColor('#888')
        .text('Gracias por su confianza.', { align: 'center' })
        .text(`Emitido automáticamente el ${moment().format('LLL')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ mensaje: 'Error al generar la factura PDF' });
      }
    }
  }

}
