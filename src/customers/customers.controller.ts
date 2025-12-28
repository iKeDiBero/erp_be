import { Controller, Put } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ResponseCustomerDto } from './dtos/customer-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('customers')
export class CustomersController {

    constructor(private readonly customersService: CustomersService) {}

    @Get()
    async findAll() {
        const customers = await this.customersService.findAll();
        return plainToInstance(ResponseCustomerDto, customers, { excludeExtraneousValues: true });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const customer = await this.customersService.findOne(id);
        return plainToInstance(ResponseCustomerDto, customer, { excludeExtraneousValues: true });
    }

    @Post()
    async create(@Body() createCustomerDto: any) {
        const customer = await this.customersService.create(createCustomerDto);
        return plainToInstance(ResponseCustomerDto, customer, { excludeExtraneousValues: true });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
        const customer = await this.customersService.update(id, updateCustomerDto);
        return plainToInstance(ResponseCustomerDto, customer, { excludeExtraneousValues: true });
    }
    
}
