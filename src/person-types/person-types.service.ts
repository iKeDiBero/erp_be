import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PersonTypesService {

    constructor(private readonly dataSource: DataSource) { }
    
    async findAll() {

        const sql = `
        SELECT 
            id,
            code,
            description,
            is_active
          FROM person_types
        `;

        const rows = await this.dataSource.query(sql);
        return rows;
       
    }

}
