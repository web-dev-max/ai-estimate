import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!user) throw new NotFoundException('Пользователь не найден');

      const { ...safeUser } = user;
      return safeUser;
    } catch (error) {
      console.error('ОШИБКА В getMe:', error);
      throw error;
    }
  }

  async updateMe(userId: string, data: UpdateUserDto) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data,
      });
      return this.getMe(userId);
    } catch (error) {
      console.error('ОШИБКА В updateMe:', error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      return await this.prisma.userProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    } catch (error) {
      console.error('ОШИБКА В getProfile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      return this.prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    } catch (error) {
      console.error('ОШИБКА В updateProfile:', error);
      throw error;
    }
  }
}
