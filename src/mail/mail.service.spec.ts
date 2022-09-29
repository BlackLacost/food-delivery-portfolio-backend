import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from 'src/mail/mail.service';

const sendMailMock = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            host: 'host',
            port: 123,
            secure: true,
            fromEmail: 'from@mail.com',
            password: 'pass',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendMail', () => {
      const [email, code] = ['to@mail.com', 'code'];
      service.sendEmail = jest.fn();

      service.sendVerificationEmail(email, code);

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(code),
        email,
      );
    });
  });

  describe('sendEmail', () => {
    it('should return true if email was sended', async () => {
      const [subject, content, to] = ['subject', 'content', 'to'];

      const result = await service.sendEmail(subject, content, to);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to,
          subject,
          text: content,
        }),
      );
      expect(result).toEqual(true);
    });

    it('should return false if email was not sended', async () => {
      const [subject, content, to] = ['subject', 'content', 'to'];
      sendMailMock.mockRejectedValue(new Error());

      const result = await service.sendEmail(subject, content, to);

      expect(result).toEqual(false);
    });
  });
});
