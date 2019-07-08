import {inject, injectable} from 'inversify';
import {createTransport} from 'nodemailer';
import TYPES from '../container/types';
import {IConfig} from '../utils/interfaces/interfaces';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import * as pug from 'pug';
import * as moment from 'moment';
import {ServerError} from '../utils/request.utils';


@injectable()
export class MailService {

  transport: Mail;
  private templateCache = {};
  private templatesPath;

  constructor(
    @inject(TYPES.Config) private config: IConfig,
  ) {
    this.templatesPath = path.join(__dirname, 'templates');
    this.transport = createTransport(new SMTPTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      }
    }));
  }

  public async sendEmail(from, to, data, template, subject): Promise<void> {
    try {
      if (!this.templateCache[template]) {
        this.templateCache[template] = pug.compileFile(path.join(this.templatesPath, (template + '.pug')));
      }
      await this.transport.sendMail({
        from: from,
        to: to,
        html: this.templateCache[template](data),
        subject: subject,
      })
    } catch (e) {
      throw new ServerError(`Cant send email! ${e}`);
    }
  }

  public async sendEmailReport(from, to, data, template, subject, pdf): Promise<void> {
    try {
      if (!this.templateCache[template]) {
        this.templateCache[template] = pug.compileFile(path.join(this.templatesPath, (template + '.pug')));
      }

      await this.transport.sendMail({
        from: from,
        to: to,
        html: this.templateCache[template](data),
        subject: subject,
        attachments: [
          {
            filename: `report-${moment().format('YYYY MMM DD')}.pdf`,
            contentType: 'application/pdf',
            content: pdf
          }
        ]
      })
    } catch (e) {
      throw new ServerError(`Cant send report email! ${e}`);
    }
  }
}
