import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { VoucherModule } from './voucher/voucher.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [RedisModule, AuthModule, UsersModule, VoucherModule, CustomerModule, ProductModule],
})
export class AppModule {}
