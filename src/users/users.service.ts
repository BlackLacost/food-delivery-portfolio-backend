import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountInput } from 'src/users/dtos/create-account.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exists = await this.users.findOneBy({ email });
      if (exists) {
        return 'There is a user with that email already';
      }
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      return "Couldn't create account";
    }
  }
}
