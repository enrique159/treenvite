import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async update(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.users.findOneByOrFail({ id: userId });
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    return this.users.save(user);
  }
}
