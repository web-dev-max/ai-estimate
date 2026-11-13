import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { TelegramInitDataVerifier } from './telegram-init-data.verifier';
import { RedisService } from '../redis/redis.service';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly verifier: TelegramInitDataVerifier,
    private readonly redis: RedisService,
  ) {}

  async authenticateTelegram(initData: string): Promise<{ accessToken: string }> {
    this.verifier.verify(initData);

    // Защита от replay (одинаковый initData нельзя использовать дважды)
    const dataHash = createHash('sha256').update(initData).digest('hex');
    const replayKey = `tg_initdata:${dataHash}`;

    if (await this.redis.exists(replayKey)) {
      throw new UnauthorizedException('initData has already been used');
    }
    // Запоминаем на 5 минут
    await this.redis.setWithTTL(replayKey, '1', 5 * 60);

    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) {
      throw new UnauthorizedException('Missing user data');
    }
    const tgUser = JSON.parse(userJson);
    const externalUserId = tgUser.id.toString();

    let messengerAccount = await this.prisma.messengerAccount.findUnique({
      where: { provider_externalUserId: { provider: 'telegram', externalUserId } },
      include: { user: true },
    });

    if (!messengerAccount) {
      const newUser = await this.prisma.user.create({
        data: {
          status: 'active',
          messengerAccounts: {
            create: {
              provider: 'telegram',
              externalUserId,
              username: tgUser.username,
            },
          },
        },
        include: { messengerAccounts: true },
      });
      messengerAccount = newUser.messengerAccounts[0] as any;
    }

    const payload = { sub: messengerAccount?.userId, provider: 'telegram' };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
