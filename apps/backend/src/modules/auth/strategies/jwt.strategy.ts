import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.sub,
      provider: payload.provider,
    };
  }
}
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZTFkNzRiMC04M2I2LTRmMGQtYWU0OS01MTU3MjRhNGUwYjgiLCJwcm92aWRlciI6InRlbGVncmFtIiwiaWF0IjoxNzk1NTk2NjE4LCJleHAiOjE3OTU2MDAyMTh9.vWA13rlbvqjr44v_cUcLrnC-fN42MWTd-HRBAKmJjL4"
