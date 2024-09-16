import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [RedisModule, AuthModule, UsersModule, VoucherModule],
})
export class AppModule {}
