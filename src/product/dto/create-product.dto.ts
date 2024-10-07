import { IsDecimal, IsNotEmpty, IsPositive, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsPositive()
  @IsDecimal({ decimal_digits: '8' })
  price: number;
}
