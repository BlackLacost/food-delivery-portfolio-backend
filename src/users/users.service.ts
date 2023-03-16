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
import {
  UserCredentialError,
  UserExistsError,
  UserNotFoundError,
} from 'src/users/errors/users.error';
import { VerificationCodeNotFoundError } from 'src/users/errors/verifications.error';
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
    const exists = await this.users.findOneBy({ email });

    if (exists) return { error: new UserExistsError(email) };

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
    await this.mailService.sendVerificationEmail(user.email, verification.code);

    const token = this.jwtService.sign({ id: user.id });
    return { token };
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findOne({
      where: { email },
      select: { id: true, password: true },
    });
    if (!user) return { error: new UserCredentialError() };

    const passwordCorrect = await user.checkPassword(password);
    if (!passwordCorrect) return { error: new UserCredentialError() };

    const token = this.jwtService.sign({ id: user.id });
    return { token };
  }

  async findById(id: number): Promise<UserProfileOuput> {
    const user = await this.users.findOneBy({ id });
    if (!user) return { error: new UserNotFoundError(id) };

    return { user };
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) return { error: new UserNotFoundError(userId) };

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

    const editedProfile = await this.users.save(user);
    return { user: editedProfile };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const verification = await this.verifications.findOne({
      where: { code },
      // loadRelationIds: true,
      relations: { user: true },
    });

    if (!verification)
      return { error: new VerificationCodeNotFoundError(code) };

    verification.user.verified = true;
    await this.users.save(verification.user);
    await this.verifications.delete(verification.id);
  }
}
