import * as express from 'express';
import {injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  public async handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!await this.httpContext.user.isAuthenticated()) {
      return res.status(401).send('Wrong token');
    }
    next();
  }
}
