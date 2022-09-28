import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { LoginInput } from 'src/users/dtos/login.dto';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exists', async () => {
      const createAccountArgs = { email: '', password: '', role: 0 };
      usersRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('shoud create a new user', async () => {
      const createAccountArgs = {
        email: 'test@mail.com',
        password: 'pass',
        role: 0,
      };
      usersRepository.findOneBy.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        createAccountArgs.email,
        'code',
      );
      expect(result).toEqual({ ok: true });
    });

    it('shoud fail on exception', async () => {
      const createAccountArgs = {
        email: 'test@mail.com',
        password: 'pass',
        role: 0,
      };
      usersRepository.findOneBy.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs: LoginInput = { email: 'test@mail.ru', password: 'pass' };

    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('should return token if password corrent', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockedUser.id });
      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });
  });

  describe('findById', () => {
    it('should find an existing user', async () => {
      usersRepository.findOneByOrFail.mockResolvedValue({ id: 1 });

      const result = await service.findById(1);

      expect(result).toEqual({ ok: true, user: { id: 1 } });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneByOrFail.mockRejectedValue(new Error());

      const result = await service.findById(1);

      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  it.todo('editProfile');
  it.todo('verifyEmail');
});
