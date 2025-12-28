import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
// import { DocumentTypes } from '../entities/entities/document-type.entity';

@Injectable()
export class DocumentTypesService {

    constructor(private readonly dataSource: DataSource) { }

    async findAll() {
        const sql = `
          SELECT
            id,
            code,
            description,
            sunat_code AS sunatCode
          FROM document_types where is_active = true
        `;
        const rows = await this.dataSource.query(sql);
        return rows;
    }

}
