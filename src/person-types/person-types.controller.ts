import { Controller, Get } from '@nestjs/common';
import { PersonTypesService } from './person-types.service';
import { PersonTypeResponseDto } from './dtos/person-type-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('person-types')
export class PersonTypesController {

    constructor(private readonly personTypesService: PersonTypesService) { }

    @Get()
    async findAll() {
        const personTypes =  await this.personTypesService.findAll();
        return plainToInstance(PersonTypeResponseDto, personTypes, { excludeExtraneousValues: true });
    }

}