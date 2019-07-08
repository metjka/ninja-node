import * as moment from 'moment';
import * as PDF from 'pdfkit';
import container from '../container/container';
import TYPES from '../container/types';
import {MailService} from '../mail/mail.service';
import {OrderService} from '../order/order.service';
import {UserService} from '../users/user.service';

export const sendReport = async (config) => {
  try {
    const today = moment().format('YYYY-MMM-DD');
    const orderService = container.get<OrderService>(TYPES.OrderService);
    const mailService = container.get<MailService>(TYPES.MailService);
    const userService = container.get<UserService>(TYPES.UserService);
    const admins = await userService.gerAdmins();
    const report = await orderService.getReport();
    const pdf = new PDF();
    pdf
      .text(`how much money was gained:${report.gained}`)
      .moveDown(1)
      .text('number of sold products:');
    report.soldProducts.forEach((prod) => {
      pdf.moveDown(1)
        .text(`              ${prod.name}: ${prod.timesSold}`);
    });
    pdf.moveDown(1)
      .text(`the best selling product yesterday: ${report.topSeller.name}: ${report.topSeller.timesSold}`);
    pdf.end();

    return await Promise.all(admins.map((user) => mailService.sendEmailReport(
      config.SMTP_FROM,
      user.email,
      report,
      'report',
      `Report-${today}`,
      pdf,
    )));
  } catch (e) {
    console.log(e);
  }
};
