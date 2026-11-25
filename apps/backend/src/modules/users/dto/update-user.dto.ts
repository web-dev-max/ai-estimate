import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'master@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @ApiProperty({ required: false, example: '+79991234567' })
  @IsOptional()
  @Matches(/^\+7\d{10}$/, { message: 'Телефон должен быть в формате +79991234567' })
  phone?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Москва' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, example: 'Электрик' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ required: false, example: '770123456789' })
  @IsOptional()
  @Matches(/^\d{10,12}$/, { message: 'ИНН должен содержать 10 или 12 цифр' })
  inn?: string;

  @ApiProperty({ required: false, example: '1234567890123' })
  @IsOptional()
  @Matches(/^\d{13,15}$/, { message: 'ОГРН/ОГРНИП должен содержать 13 или 15 цифр' })
  ogrn?: string;
}
