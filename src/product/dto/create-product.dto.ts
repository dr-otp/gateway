import { IsDecimal, IsNotEmpty, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsDecimal({ decimal_digits: '8', force_decimal: true })
  price: string;
}
