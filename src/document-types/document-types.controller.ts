import { Controller, Get } from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { plainToInstance } from 'class-transformer';
import { DocumentTypeResponseDto } from './dtos/document-type-response.dto';

@Controller('document-types')
export class DocumentTypesController {

    constructor(private readonly documentTypesService: DocumentTypesService) { }

    @Get()
    async findAll() {
        
        const documentTypes =  await this.documentTypesService.findAll();
        return plainToInstance(DocumentTypeResponseDto, documentTypes);
    }

}
