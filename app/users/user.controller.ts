import 'reflect-metadata';
import * as express from 'express';
import {
  BaseHttpController,
  BaseMiddleware,
  controller,
  httpPost,
  injectHttpContext,
  interfaces,
  request,
  requestBody,
  response
} from 'inversify-express-utils';
import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {UserService} from './user.service';
import {Config} from '../db/mongo';
import {check} from 'express-validator';
import {validate} from '../utils/request.utils';
import {UserLogin, UserRegister} from './user.dto';
import Controller = interfaces.Controller;

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  public async handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (!await this.httpContext.user.isAuthenticated()) {
      return res.status(401).send('Wrong token');
    }
    next();
  }
}


@controller('/user')
export class UserController extends BaseHttpController implements Controller {
  @injectHttpContext protected readonly httpContext: interfaces.HttpContext;

  constructor(
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.Config) private config: Config
  ) {
    super();
  }

  @httpPost('/login',)
  public login(@response() res: express.Response,
               @requestBody() user?: UserLogin) {
    return Promise.resolve()
      .then(() => this.userService.login(user))
      .then(result => res.json(result));
  }

  @httpPost('/register',
    validate([
      check('email').isEmail(),
      check('login').isLength({min: 3}),
      check('password')
        .isLength({min: 5}).withMessage('Must be at least 5 chars long')
        .matches(/\d/).withMessage('Must contain a number')
    ]))
  public register(@response() res: express.Response,
                  @request() req: express.Request,
                  @requestBody() user?: UserRegister) {
    return Promise.resolve()
      .then(() => this.userService.register(user))
      .then(result => res.json(result));
  }
}
