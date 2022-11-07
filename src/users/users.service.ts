import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coords } from 'src/common/entities/coords.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from 'src/users/dtos/create-account.dto';
import {
  EditProfileInput,
  EditProfileOutput,
} from 'src/users/dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import { UserProfileOuput } from 'src/users/dtos/user-profile.dto';
import { VerifyEmailOutput } from 'src/users/dtos/verify-email.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(Coords)
    private readonly coords: Repository<Coords>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
    latitude,
    longitude,
    address,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOneBy({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }

      let user: User;

      if (role === UserRole.Client) {
        console.log(latitude, longitude);
        const coords = await this.coords.save(
          this.coords.create({ latitude, longitude }),
        );
        user = await this.users.save(
          this.users.create({ email, password, role, address, coords }),
        );
      } else {
        user = await this.users.save(
          this.users.create({ email, password, role }),
        );
      }

      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: { id: true, password: true },
      });
      if (!user) return { ok: false, error: 'User not found' };

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) return { ok: false, error: 'Wrong password' };

      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: "Can't log user in" };
    }
  }

  async findById(id: number): Promise<UserProfileOuput> {
    try {
      const user = await this.users.findOneByOrFail({ id });
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOneBy({ id: userId });

      if (email && email !== user.email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        await this.mailService.sendVerificationEmail(
          user.email,
          verification.code,
        );
      }

      if (password) {
        user.password = password;
      }

      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not update profile' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        // loadRelationIds: true,
        relations: { user: true },
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
