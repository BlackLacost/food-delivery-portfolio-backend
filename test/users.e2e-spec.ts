import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'blacklacost@gmail.com',
  password: 'qwe',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string, token: string) =>
    baseTest().set('X-JWT', token).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.get(Connection).dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const mutation = ({ email, password }) => `
          mutation {
            createAccount(input: {
              email: "${email}",
              password: "${password}",
              role: Owner
            }) {
              ok,
              error
            }
          }`;

    it('should create account', async () => {
      const {
        status,
        body: {
          data: { createAccount },
        },
      } = await publicTest(mutation(testUser));

      expect(status).toEqual(200);
      expect(createAccount.ok).toEqual(true);
      expect(createAccount.error).toEqual(null);
    });

    it('should fail if account already exists', async () => {
      const {
        status,
        body: {
          data: { createAccount },
        },
      } = await publicTest(mutation(testUser));

      expect(status).toEqual(200);
      expect(createAccount.ok).toEqual(false);
      expect(createAccount.error).toEqual(expect.any(String));
    });
  });

  describe('login', () => {
    const mutation = ({ email, password }) => `
          mutation {
            login(input: {
              email: "${email}",
              password: "${password}",
            }) {
              ok,
              error,
              token
            }
          }`;

    it('should login with correct credentials', async () => {
      const {
        status,
        body: {
          data: { login },
        },
      } = await publicTest(mutation(testUser));

      expect(status).toEqual(200);
      expect(login.ok).toEqual(true);
      expect(login.error).toEqual(null);
      expect(login.token).toEqual(expect.any(String));
      jwtToken = login.token;
    });

    it('should not be able to login with wrong password', async () => {
      const {
        status,
        body: {
          data: { login },
        },
      } = await publicTest(mutation({ ...testUser, password: 'wrong pass' }));

      expect(status).toEqual(200);
      expect(login.ok).toEqual(false);
      expect(login.error).toEqual(expect.any(String));
      expect(login.token).toEqual(null);
    });
  });

  describe('userProfile', () => {
    let userId: number;
    const query = (userId: number) => `
    {
      userProfile(userId: ${userId}) {
        ok,
        error,
        user {
          id,
        }
      }
    }
    `;

    beforeAll(async () => {
      const user = await usersRepository.findOneBy({ email: testUser.email });
      userId = user.id;
    });

    it("should see a user's profile", async () => {
      const {
        status,
        body: {
          data: { userProfile },
        },
      } = await privateTest(query(userId), jwtToken);

      expect(status).toEqual(200);
      expect(userProfile.ok).toEqual(true);
      expect(userProfile.error).toEqual(null);
      expect(userProfile.user.id).toEqual(userId);
    });

    it('should not find a profile', async () => {
      const notExistsUserId = 666;

      const {
        status,
        body: {
          data: { userProfile },
        },
      } = await privateTest(query(notExistsUserId), jwtToken);
      console.log(userProfile);

      expect(status).toEqual(200);
      expect(userProfile.ok).toEqual(false);
      expect(userProfile.error).toEqual(expect.any(String));
      expect(userProfile.user).toEqual(null);
    });
  });

  describe('me', () => {
    const query = () => `
    {
      me {
        email
      }
    }
    `;

    it('should find my profile', async () => {
      const {
        status,
        body: {
          data: { me },
        },
      } = await privateTest(query(), jwtToken);

      expect(status).toEqual(200);
      expect(me.email).toEqual(testUser.email);
    });

    it('should not allow logged out user', async () => {
      const {
        status,
        body: { errors },
      } = await publicTest(query());

      expect(status).toEqual(200);
      expect(errors[0].message).toEqual('Forbidden resource');
    });
  });

  describe('editProfile', () => {
    const mutationEditProfile = (email: string) => `
    mutation {
      editProfile(input: {
        email: "${email}"
      }) {
        ok,
        error
      }
    }
    `;

    const queryMe = () => `
    {
      me {
        email
      }
    }
    `;

    it('should change email', async () => {
      const newEmail = 'new@gmail.com';

      const {
        status,
        body: {
          data: { editProfile },
        },
      } = await privateTest(mutationEditProfile(newEmail), jwtToken);
      const {
        body: {
          data: { me },
        },
      } = await privateTest(queryMe(), jwtToken);

      expect(status).toEqual(200);
      expect(editProfile.ok).toEqual(true);
      expect(editProfile.error).toEqual(null);
      expect(me.email).toEqual(newEmail);
    });
  });

  it.todo('verifyEmail');
});
