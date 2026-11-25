import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { z } from 'zod';

export class AuthSessionDto {
  @ApiProperty({ description: 'Строка initData из Telegram WebApp' })
  @IsString()
  @IsNotEmpty()
  initData!: string;
}

const AuthSessionSchema = z.object({
  initData: z.string().min(1),
});

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  @ApiBody({ type: AuthSessionDto })
  async createSession(@Body() body: AuthSessionDto) {
    const parsed = AuthSessionSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid request body');
    }
    return this.authService.authenticateTelegram(parsed.data.initData);
  }
}
