import { Controller, Put } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {

    constructor(private readonly customersService: CustomersService) {}

    @Get()
    findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Post()
    create(@Body() createCustomerDto: any) {
        return this.customersService.create(createCustomerDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: any) {
        return this.customersService.update(id, updateCustomerDto);
    }

}
