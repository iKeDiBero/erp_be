import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExchangeService } from './exchange/exchange.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly exchange: ExchangeService) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'exchange_rates_hourly' })
  async handleHourlyFetch() {
    this.logger.log('Starting hourly exchange rates fetch');
    try {
      const rates = await this.exchange.fetchRates();
      this.logger.log(`Fetched rates: ${JSON.stringify(rates)}`);
    
    } catch (err) {
      this.logger.error('Hourly fetch failed', err);
    }
  }
}