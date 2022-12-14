import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from 'src/jwt/jwt.service';

const TOKEN = 'TOKEN';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => TOKEN),
  verify: jest.fn(() => ({ id: USER_ID })),
}));

const TEST_KEY = 'testKey';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const result = service.sign({ id: USER_ID });

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
      expect(result).toEqual(TOKEN);
    });
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const result = service.verify(TOKEN);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
      expect(result).toEqual({ id: USER_ID });
    });
  });
});
