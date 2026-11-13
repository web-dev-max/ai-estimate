import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { z } from 'zod';

const AuthSessionSchema = z.object({
  initData: z.string().min(1),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async createSession(@Body() body: unknown) {
    const parsed = AuthSessionSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid request body');
    }
    return this.authService.authenticateTelegram(parsed.data.initData);
  }
}
