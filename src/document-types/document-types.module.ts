import { Module } from '@nestjs/common';
import { DocumentTypesController } from './document-types.controller';
import { DocumentTypesService } from './document-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { DocumentTypes } from '../entities/entities/document-type.entity';

@Module({
  // imports: [TypeOrmModule.forFeature([DocumentTypes])],
  controllers: [DocumentTypesController],
  providers: [DocumentTypesService]
})
export class DocumentTypesModule {}
