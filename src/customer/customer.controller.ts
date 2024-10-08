import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, tap } from 'rxjs';

import { Auth, CurrentUser, Role, User } from 'src/auth';
import { PaginationDto, ParseCuidPipe } from 'src/common';
import { envs, NATS_SERVICE } from 'src/config';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { Customer } from './interfaces/customer.interface';

@Controller('customers')
@Auth(Role.Moderator, Role.Admin)
export class CustomerController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get('health')
  healthCheck() {
    return this.client.send('customer.health', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @User() user: CurrentUser) {
    return this.client.send('customer.create', { createCustomerDto, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (newCustomer) => {
        // Update cache with the new user data
        await this.cacheManager.set(`customer:${newCustomer.id}`, newCustomer, envs.cacheTtl);
        await this.setNewCustomerCache(newCustomer);
        // Invalidate user list cache
        await this.invalidateCustomerListCache();
      }),
    );
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto, @User() user: CurrentUser) {
    const cacheKey = this.getCustomerListCacheKey(pagination);
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) return cachedData;

    return this.client.send('customer.find.all', { pagination, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (res) => await this.cacheManager.set(cacheKey, res, envs.cacheTtl)),
    );
  }

  @Get('summary')
  async findAllSummary(@Query() pagination: PaginationDto, @User() user: CurrentUser) {
    const cacheKey = this.getCustomerListCacheKey(pagination, true);
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) return cachedData;

    return this.client.send('customer.find.all.summary', { pagination, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (res) => await this.cacheManager.set(cacheKey, res, envs.cacheTtl)),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseCuidPipe) id: string, @User() user: CurrentUser) {
    const cachedData = await this.cacheManager.get(`customer:${id}`);

    if (cachedData) return cachedData;

    return this.client.send('customer.find.one', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (customer) => await this.cacheManager.set(`customer:${id}`, customer, envs.cacheTtl)),
    );
  }

  @Get('code/:code')
  async findOneByCode(@Param('code', ParseIntPipe) code: number, @User() user: CurrentUser) {
    const cachedData = await this.cacheManager.get(`customer:code:${code}`);

    if (cachedData) return cachedData;

    return this.client.send('customer.find.one.code', { code, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap((res) => this.cacheManager.set(`customer:code:${code}`, res, envs.cacheTtl)),
    );
  }

  @Get(':id/summary')
  async findOneSummary(@Param('id', ParseCuidPipe) id: string, @User() user: CurrentUser) {
    const cachedData = await this.cacheManager.get(`customer:summary:${id}`);

    if (cachedData) return cachedData;

    return this.client.send('customer.find.one.summary', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (customer) => await this.cacheManager.set(`customer:summary:${id}`, customer, envs.cacheTtl)),
    );
  }

  @Patch(':id')
  update(@Param('id', ParseCuidPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto, @User() user: CurrentUser) {
    return this.client.send('customer.update', { updateCustomerDto: { ...updateCustomerDto, id }, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (updatedCustomer) => {
        await this.invalidateCustomerCache(updatedCustomer);
        await this.invalidateCustomerListCache();
        await this.setNewCustomerCache(updatedCustomer);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseCuidPipe) id: string, @User() user: CurrentUser) {
    return this.client.send('customer.remove', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (customer: Customer) => {
        await this.invalidateCustomerCache(customer);
        await this.invalidateCustomerListCache();
      }),
    );
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseCuidPipe) id: string, @User() user: CurrentUser) {
    return this.client.send('customer.restore', { id, user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
      tap(async (restoredCustomer) => {
        await this.invalidateCustomerCache(restoredCustomer);
        await this.invalidateCustomerListCache();
        await this.setNewCustomerCache(restoredCustomer);
      }),
    );
  }

  private getCustomerListCacheKey(paginationDto: PaginationDto, summary: boolean = false): string {
    return summary
      ? `customer:summary:page:${paginationDto.page}:limit:${paginationDto.limit}`
      : `customer:page:${paginationDto.page}:limit:${paginationDto.limit}`;
  }

  private async invalidateCustomerListCache() {
    const keys = await this.cacheManager.store.keys(`customers:*`);
    for (const key of keys) await this.cacheManager.del(key);
  }

  private async invalidateCustomerCache(customer: Customer) {
    await this.cacheManager.del(`customer:${customer.id}`);
    await this.cacheManager.del(`customer:code:${customer.code}`);
    await this.cacheManager.del(`customer:summary:${customer.id}`);
  }

  private async setNewCustomerCache(newCustomer: Customer) {
    const summarizedCustomer = { id: newCustomer.id, code: newCustomer.code, name: newCustomer.name, email: newCustomer.email };
    await this.cacheManager.set(`user:${newCustomer.id}`, newCustomer, envs.cacheTtl);
    await this.cacheManager.set(`user:code:${newCustomer.code}`, newCustomer, envs.cacheTtl);
    await this.cacheManager.set(`user:summary:${newCustomer.id}`, summarizedCustomer, envs.cacheTtl);
  }
}
