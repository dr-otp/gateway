import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { VoucherController } from './voucher.controller';

@Module({
  controllers: [VoucherController],
  imports: [NatsModule],
})
export class VoucherModule {}
