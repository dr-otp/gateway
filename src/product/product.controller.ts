import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { Auth, CurrentUser, Role, User } from 'src/auth';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
@Auth()
export class ProductController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  @Auth(Role.Moderator, Role.Admin)
  async create(@Body() createProductDto: CreateProductDto, @User() user: CurrentUser) {
    return this.client.send('product.create', { createProductDto, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto, @User() user: CurrentUser) {
    return this.client.send('product.find.all', { pagination, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('summary')
  async findAllSummary(@Query() pagination: PaginationDto, @User() user: CurrentUser) {
    return this.client.send('product.find.all.summary', { pagination, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: CurrentUser) {
    return this.client.send('product.find.one', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id/summary')
  async findOneSummary(@Param('id') id: string, @User() user: CurrentUser) {
    return this.client.send('product.find.one.summary', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User() user: CurrentUser) {
    return this.client.send('product.update', { updateProductDto: { id, ...updateProductDto }, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id/restore')
  @Auth(Role.Admin)
  async restore(@Param('id') id: string, @User() user: CurrentUser) {
    return this.client.send('product.restore', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  @Auth(Role.Admin)
  async remove(@Param('id') id: string, @User() user: CurrentUser) {
    return this.client.send('product.remove', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
