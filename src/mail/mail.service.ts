import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from 'src/mail/mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(subject: string, content: string, to: string) {
    const url = 'https://api.unisender.com/ru/api/sendEmail';
    const sender_name = 'Доставка Еды';
    const sender_email = 'blacklacost@gmail.com';

    try {
      const response = await fetch(
        `${url}?format=json&api_key=${this.options.api_key}&email=${to}&sender_name=${sender_name}&subject=${subject}&body=${content}&sender_email=${sender_email}&list_id=1`,
        { method: 'GET' },
      );

      const data = await response.json();

      if (!data.result.email_id) return false;

      return true;

      //   let transporter = nodemailer.createTransport({
      //     host: this.options.host,
      //     port: this.options.port,
      //     secure: this.options.secure,
      //     auth: {
      //       user: this.options.fromEmail,
      //       pass: this.options.password,
      //     },
      //   });

      //   await transporter.sendMail({
      //     from: `Доставка Еды blacklacost@inbox.ru`,
      //     to,
      //     subject,
      //     text: content,
      //   });
      //   return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    return this.sendEmail(
      'Подтвердите свою почту',
      `Подтвердите свою почту, перейдя по ссылке <a href="${this.options.url}/confirm?code=${code}">${this.options.url}/confirm?code=${code}</a>`,
      email,
    );
  }
}
