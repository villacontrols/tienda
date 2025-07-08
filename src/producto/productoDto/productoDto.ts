import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
   nombre: string;

  @IsNotEmpty()
  @IsString()
   descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
   precio: number;

  @IsNumber()
  @Min(0)
   stock: number;

  @IsOptional()
  @IsUrl()
   imageUrl?: string;
}
