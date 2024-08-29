import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [OtpController],
  imports: [NatsModule],
})
export class OtpModule {}
