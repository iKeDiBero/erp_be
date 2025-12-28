import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {

    constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

    async checkDatabaseConnection() {
        try {
            await this.dataSource.query('SELECT 1');
            return { database: 'up' };
        } catch (error) {
            return { database: 'down', error: error.message };
        }
    }

}


