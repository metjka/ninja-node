import {Response} from 'express';
import {inject} from 'inversify';
import {controller, httpGet, interfaces, response, TYPE} from 'inversify-express-utils';
import TYPES from '../container/types';

@controller('/ping')
export class PingController {

  @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext;

  @httpGet('/')
  public pong(@response() res: Response) {
    return res.type('text/plain').send('pong');
  }

  @httpGet('/sec', TYPES.AuthMiddleware)
  public pongSecure(@response() res: Response) {
    return res.type('text/plain').send('secure pong');
  }

}
