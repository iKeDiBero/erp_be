import { Module } from '@nestjs/common';
import { PersonTypesController } from './person-types.controller';
import { PersonTypesService } from './person-types.service';

@Module({
  controllers: [PersonTypesController],
  providers: [PersonTypesService]
})
export class PersonTypesModule {}
