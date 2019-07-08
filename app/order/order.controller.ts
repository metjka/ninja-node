import * as express from 'express';
import {inject} from 'inversify';
import {controller, httpGet, httpPost, requestBody, response} from 'inversify-express-utils';
import TYPES from '../container/types';
import {OrderService} from './order.service';

@controller('/orders')
export class OrderController {

  constructor(
    @inject(TYPES.OrderService) private orderService: OrderService,
  ) {
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async creatOrder(@response() res: express.Response,
                          @requestBody() order: {orderPositions: Array<{number: number, item: string}>}) {
    const newOrder = await this.orderService.create(order);
    return res.status(201).json(newOrder);
  }

  @httpGet('/', TYPES.AuthMiddleware, TYPES.AdminMiddleware)
  public async getAll(@response() res: express.Response) {
    const newOrder = await this.orderService.getAll();
    return res.json(newOrder);
  }

  @httpGet('/report', TYPES.AuthMiddleware, TYPES.AdminMiddleware)
  public async getReport(@response() res: express.Response) {
    const report = await this.orderService.getReport();
    return res.json(report);
  }
}
