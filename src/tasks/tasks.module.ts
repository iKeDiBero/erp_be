import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/exchange.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [ExchangeModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}