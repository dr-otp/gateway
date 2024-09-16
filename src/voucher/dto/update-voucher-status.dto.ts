import { IsEnum } from 'class-validator';
import { IsCuid } from 'src/common';
import { VoucherStatus } from '../interfacers/voucher.interfaces';

export class UpdateVoucherStatusDto {
  @IsCuid()
  id: string;

  @IsEnum(VoucherStatus)
  status: VoucherStatus;
}
