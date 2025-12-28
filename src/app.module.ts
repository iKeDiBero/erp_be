import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DocumentTypesModule } from './document-types/document-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Solo para desarrollo, desactivar en producción
      }),
      inject: [ConfigService],
    }),
    CustomersModule,
    AuthModule,
    HealthModule,
    DocumentTypesModule,
  ],
})
export class AppModule {}
