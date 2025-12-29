import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomersService {

    constructor(private readonly dataSource: DataSource) { }

    findAll() {

        const sql = `SELECT id, person_type_id, document_type_id, document_number, name, 
        address, ubigeo, country_code, email, phone, is_with_holding_agent, with_holding_rate, 
        is_active, created_at, updated_at 
        FROM clients`;

        return this.dataSource.query(sql);

    }

    async findOne(id: string) {
        const sql = `SELECT id, person_type_id, document_type_id, document_number, name,
      address, ubigeo, country_code, email, phone, is_with_holding_agent, with_holding_rate,
      is_active, created_at, updated_at
      FROM clients WHERE id = ?`;

        const rows = await this.dataSource.query(sql, [id]);

        if (!rows || rows.length === 0) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return rows[0];
    }

    create(createCustomerDto: any) {
        return `This action adds a new customer`;
    }

    update(id: string, updateCustomerDto: any) {
        throw new Error('Method not implemented.');
    }

}
