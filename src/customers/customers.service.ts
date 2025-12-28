import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersService {
    
    update(id: string, updateCustomerDto: any) {
        throw new Error('Method not implemented.');
    }

    findAll() {
        
        return `This action returns all customers`;
    }

    findOne(id: string) {
        return `This action returns a #${id} customer`;
    }

    create(createCustomerDto: any) {
        return `This action adds a new customer`;
    }


}
