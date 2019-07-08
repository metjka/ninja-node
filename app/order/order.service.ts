import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {Model} from 'mongoose';
import {IOrderModel} from './order.model';
import {ClientError, parseObjectId, streq} from '../utils/request.utils';
import {IProduct, IProductModel} from '../product/product.model';
import {MailService} from '../mail/mail.service';
import {interfaces, TYPE} from 'inversify-express-utils';
import {IConfig, IReport} from '../utils/interfaces/interfaces';
import * as _ from 'lodash';
import moment = require('moment');

@injectable()
export class OrderService {
  constructor(
    @inject(TYPES.Config) private config: IConfig,
    @inject(TYPES.OrderModel) private orderModel: Model<IOrderModel>,
    @inject(TYPES.ProductModel) private productModel: Model<IProductModel>,
    @inject(TYPES.MailService) private mailService: MailService,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext
  ) {
  }

  public async create(order: {orderPositions: {number: number; item: string}[]}) {
    try {

      const ids = order.orderPositions.map(item => parseObjectId(item.item));
      const products: IProduct[] = await this.productModel.find({_id: {$in: ids}}).exec();
      if (products.length !== ids.length) {
        throw new ClientError(`Some of products doesn't exist!`)
      }

      const orders = order.orderPositions.map(orderPosition => {
        const product = products.find(product => streq(product._id, orderPosition.item));
        return {
          number: orderPosition.number,
          productId: product._id,
          price: product.price,
          total: orderPosition.item,
          name: product.name
        }
      });

      const newOrder = new this.orderModel();
      newOrder.orderedBy = this.httpContext.user.details._id;
      newOrder.orderPositions = orders;

      const savedOrder = await newOrder.save();
      const savedOrderJson = savedOrder.toJSON();

      setImmediate(() => {
        this.mailService.sendEmail(
          this.config.SMTP_FROM,
          this.httpContext.user.details.email,
          {
            userName: this.httpContext.user.details.fullName,
            orders: savedOrderJson.orderPositions,
            total: savedOrder.total
          },
          'new-order',
          'New order')
      });
      return savedOrderJson;
    } catch (e) {
      throw new ClientError(e.message);
    }
  }

  public async getAll(): Promise<IOrderModel[]> {
    const orders = await this.orderModel.find().lean().exec();
    return orders;
  }

  public async getReport(): Promise<IReport> {
    const orders = await this.orderModel.find({
      createdAt: {
        $gte: moment().subtract(1, 'd').toDate(),
        $lt: moment().toDate(),
      }
    }).exec();
    const gained = orders.map(order => order.total).reduce((acc, val) => _.add(acc, val), 0);
    const orderItems = orders
      .reduce((acc, val) => {
        acc.push(...val.orderPositions);
        return acc;
      }, []);
    const numberOfSoldProducts = orderItems
      .reduce((acc, val) => {
        if (acc[val.productId + '']) {
          acc[val.productId + ''] = _.add(acc[val.productId + ''], val.number);
        } else {
          acc[val.productId + ''] = val.number;
        }
        return acc;
      }, {});

    const products = await this.productModel.find({_id: {$in: Object.keys(numberOfSoldProducts)}}).lean().exec();
    const soldProducts = products.map(prod => ({...prod, timesSold: numberOfSoldProducts[prod._id + '']}))
      .sort((prod1, prod2) => prod2.timesSold - prod1.timesSold);
    const report = {
      gained: gained,
      soldProducts: soldProducts,
      topSeller: soldProducts[0],
      time: moment().format('YYYY MMM DD')
    };
    return report;
  }
}
