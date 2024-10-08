import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { VoucherItemDto } from './voucher-item.dto';
import { IsCuid } from 'src/common';

export class CreateVoucherDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => VoucherItemDto)
  @ValidateNested({ each: true })
  items: VoucherItemDto[];

  @IsCuid()
  @IsNotEmpty()
  @Type(() => String)
  customerId: string;
}
