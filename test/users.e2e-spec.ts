import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'typeorm';
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
type User = typeof testUser;

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.get(Connection).dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const mutation = ({ email, password }: User) => `
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
    const mutation = ({ email, password }: User) => `
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

  it.todo('userProfile');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
