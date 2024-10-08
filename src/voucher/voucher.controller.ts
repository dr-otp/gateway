import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { Auth, CurrentUser, Role, User } from 'src/auth';
import { PaginationDto, ParseCuidPipe } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreateVoucherDto, UpdateVoucherStatusDto } from './dto';

@Controller('vouchers')
@Auth(Role.Moderator, Role.Admin)
export class VoucherController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('health')
  healthCheck() {
    return this.client.send('voucher.health', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto, @User() user: CurrentUser) {
    return this.client.send('voucher.create', { createVoucherDto, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @User() user: CurrentUser) {
    return this.client.send('voucher.find.all', { pagination, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseCuidPipe) id: string, @User() user: CurrentUser) {
    return this.client.send('voucher.find.one', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id/status')
  update(@Body() updateDto: UpdateVoucherStatusDto) {
    return this.client.send('voucher.update.status', { updateDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  @Auth(Role.Admin)
  remove(@Param('id', ParseCuidPipe) id: string) {
    return this.client.send('voucher.remove', { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
