import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from 'src/mail/mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    content: string,
    to: string,
  ): Promise<void> {
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
        from: `Excited User blacklacost@inbox.ru`,
        to,
        subject,
        text: content,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
