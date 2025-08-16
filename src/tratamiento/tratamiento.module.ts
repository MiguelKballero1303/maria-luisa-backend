import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TratamientoService } from './tratamiento.service';
import { TratamientoController } from './tratamiento.controller';
import { Tratamiento } from './tratamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tratamiento])],
  controllers: [TratamientoController],
  providers: [TratamientoService],
})
export class TratamientoModule {}
