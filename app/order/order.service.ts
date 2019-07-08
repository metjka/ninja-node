import {inject, injectable} from 'inversify';
import {interfaces, TYPE} from 'inversify-express-utils';
import * as _ from 'lodash';
import {Model} from 'mongoose';
import TYPES from '../container/types';
import {MailService} from '../mail/mail.service';
import {IProduct, IProductModel} from '../product/product.model';
import {IConfig, IReport} from '../utils/interfaces/interfaces';
import {ClientError, NotFoundError, parseObjectId, streq} from '../utils/request.utils';
import {IOrderModel} from './order.model';
import moment = require('moment');

@injectable()
export class OrderService {
  constructor(
    @inject(TYPES.Config) private config: IConfig,
    @inject(TYPES.OrderModel) private orderModel: Model<IOrderModel>,
    @inject(TYPES.ProductModel) private productModel: Model<IProductModel>,
    @inject(TYPES.MailService) private mailService: MailService,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext,
  ) {
  }

  public async create(order: {orderPositions: Array<{number: number; item: string}>}) {
    try {
      const ids = order.orderPositions.map((item) => parseObjectId(item.item));
      const products: IProduct[] = await this.productModel.find({_id: {$in: ids}}).exec();
      if (products.length !== ids.length) {
        throw new NotFoundError(`Some of products doesn't exist!`);
      }
      const orders = order.orderPositions.map((orderPosition) => {
        const product = products.find((pr) => streq(pr._id, orderPosition.item));
        return {
          number: orderPosition.number,
          productId: product._id,
          price: product.price,
          total: orderPosition.item,
          name: product.name,
        };
      });

      const newOrder = new this.orderModel();
      newOrder.orderedBy = this.httpContext.user.details._id;
      newOrder.orderPositions = orders;

      const savedOrder = await newOrder.save();
      const savedOrderJson = savedOrder.toJSON();

      setImmediate(async () => {
        try {
          await this.mailService.sendEmail(
            this.config.SMTP_FROM,
            this.httpContext.user.details.email,
            {
              userName: this.httpContext.user.details.fullName,
              orders: savedOrderJson.orderPositions,
              total: savedOrder.total,
            },
            'new-order',
            'New order');
        } catch (e) {
          console.log(e.message);
        }
      });
      return savedOrderJson;
    } catch (e) {
      throw new ClientError(e.message);
    }
  }

  public async getAll(): Promise<IOrderModel[]> {
    try {
      return await this.orderModel.find().lean().exec();
    } catch (e) {
      throw new ClientError(`Cant get all orders! ${e}`);
    }
  }

  public async getReport(): Promise<IReport> {
    try {
      const orders = await this.orderModel.find({
        createdAt: {
          $gte: moment().subtract(1, 'd').toDate(),
          $lt: moment().toDate(),
        },
      }).exec();
      const gained = orders.map((order) => order.total).reduce((acc, val) => _.add(acc, val), 0);
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

      const products = await this.productModel
        .find({_id: {$in: Object.keys(numberOfSoldProducts)}})
        .lean().exec();
      const soldProducts = products
        .map((prod) => ({...prod, timesSold: numberOfSoldProducts[prod._id + '']}))
        .sort((prod1, prod2) => prod2.timesSold - prod1.timesSold);
      return {
        gained,
        soldProducts,
        topSeller: soldProducts[0],
        time: moment().format('YYYY MMM DD'),
      };
    } catch (e) {
      throw new ClientError(`Cant get reports! ${e}`);
    }
  }
}
