import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersResolver } from 'src/users/users.resolver';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
