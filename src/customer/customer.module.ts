import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { NatsModule } from 'src/transports/nats.module';
import { CustomerController } from './customer.controller';

@Module({
  controllers: [CustomerController],
  imports: [NatsModule, RedisModule],
})
export class CustomerModule {}
