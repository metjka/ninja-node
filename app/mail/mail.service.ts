import {inject, injectable} from 'inversify';
import {createTransport} from 'nodemailer';
import TYPES from '../container/types';
import {IConfig} from '../utils/interfaces/interfaces';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import * as pug from 'pug';
import * as PDF from 'pdfkit';
import * as moment from 'moment';


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
    if (!this.templateCache[template]) {
      this.templateCache[template] = pug.compileFile(path.join(this.templatesPath, (template + '.pug')));
    }
    await this.transport.sendMail({
      from: from,
      to: to,
      html: this.templateCache[template](data),
      subject: subject,
    })
  }

  public async sendEmailReport(from, to, data, template, subject): Promise<void> {
    if (!this.templateCache[template]) {
      this.templateCache[template] = pug.compileFile(path.join(this.templatesPath, (template + '.pug')));
    }
    const today = moment().format('YYYY-MMM-DD');
    const html = this.templateCache[template](data);
    const pdfkit1 = new PDF();
    pdfkit1
      .text(`how much money was gained:${data.gained}`)
      .moveDown(1)
      .text('number of sold products:');
    data.soldProducts.forEach(prod => {
      pdfkit1.moveDown(1)
        .text(`              ${prod.name}: ${prod.timesSold}`);
    });
    pdfkit1.moveDown(1)
      .text(`the best selling product yesterday: ${data.topSeller.name}: ${data.topSeller.timesSold}`);
    pdfkit1.end();

    await this.transport.sendMail({
      from: from,
      to: to,
      html: html,
      subject: subject,
      attachments: [
        {
          filename: `report-${today}.pdf`,
          contentType: 'application/pdf',
          content: pdfkit1 as any
        }
      ]
    })
  }
}
