import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  imports: [NatsModule],
})
export class ProductModule {}
