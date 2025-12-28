import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    private readonly http: HttpService,
    private readonly dataSource: DataSource) { }

  async fetchRates() {
    const url = `https://dolar.pe/api/public/series?pair=USD-PEN`;
    const resp = await firstValueFrom(this.http.get(url));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const sql = `INSERT INTO exchange_rates (rate_date, currency_code, base_currency, sell_rate, source, is_carry_forward) 
    VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE sell_rate = VALUES(sell_rate), is_carry_forward = VALUES(is_carry_forward)`;

    const series = resp.data.series?.['USD-PEN'];
    if (!series) return null;

    const labels = series.labels || [];
    const values = series.data || [];
    const from = resp.data.range.from;

    const lastSellRate = await queryRunner.query(
      `SELECT sell_rate, rate_date FROM exchange_rates WHERE currency_code = ? ORDER BY rate_date DESC LIMIT 1`,
      ['USD'],
    );

    this.logger.log(`API from date: ${from}`);
    this.logger.log(`Last sell rate from DB: ${JSON.stringify(lastSellRate)}`);

    const lastRow = lastSellRate.length > 0 ? lastSellRate[0].rate_date : null;
    const lastDateYmd = lastRow ? new Date(lastRow).toISOString().slice(0, 10) : null;

    if (lastDateYmd && from === lastDateYmd) {

      this.logger.log('Data is up to date, no new rates to insert');
      this.logger.log(`Last DB date: ${lastDateYmd}, API date: ${from}`);

      return resp.data;

    } else {

      this.logger.log(`Data is outdated. API date: ${from}, Current date: ${lastDateYmd}`);

      try {

        for (let i = 0; i < labels.length; i++) {
          const rateDate = from;
          const currencyCode = 'USD';
          const baseCurrency = 'PEN';
          const sellRate = values[i];
          const source = 'API';
          let isCarryForward = false;

          // this.logger.log(`Inserting rate for date ${rateDate}: ${sellRate}`);
          // this.logger.log(`Comparing with last sell rate: ${lastSellRate[0]?.sell_rate}`);

          const last = lastSellRate[0] ? parseFloat(lastSellRate[0].sell_rate) : null;

          if (last !== null && Math.abs(sellRate - last) < 0.0005) {
            isCarryForward = true;
          }
          
          await queryRunner.query(
            sql,
            [rateDate, currencyCode, baseCurrency, sellRate, source, isCarryForward],
          );
        }

        // this.logger.log('Exchange rates inserted/updated successfully');

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        this.logger.error('DB insert failed', err);
        throw err;
      } finally {
        await queryRunner.release();
      }

    }

    return resp.data;

  }

}