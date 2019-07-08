import * as express from 'express';
import {injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';

@injectable()
export class AdminMiddleware extends BaseMiddleware {
  public async handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!await this.httpContext.user.isInRole('admin')) {
      return res.status(403).send('You have to be admin to perform this action!');
    }
    next();
  }
}
