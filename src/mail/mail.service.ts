import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from 'src/mail/mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(subject: string, content: string, to: string) {
    try {
      let transporter = nodemailer.createTransport({
        host: this.options.host,
        port: this.options.port,
        secure: this.options.secure,
        auth: {
          user: this.options.fromEmail,
          pass: this.options.password,
        },
      });

      await transporter.sendMail({
        from: `Доставка Еды blacklacost@inbox.ru`,
        to,
        subject,
        text: content,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    return this.sendEmail(
      'Подтвердите свою почту',
      `Подтвердите свою почту, перейдя по ссылке ${this.options.url}/confirm?code=${code}`,
      email,
    );
  }
}
