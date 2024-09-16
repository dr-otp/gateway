import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { VoucherItemDto } from './voucher-item.dto';

export class CreateVoucherDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => VoucherItemDto)
  @ValidateNested({ each: true })
  items: VoucherItemDto[];
}
