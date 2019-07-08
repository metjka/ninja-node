import * as express from 'express';
import {check} from 'express-validator';
import {inject} from 'inversify';
import {
  controller,
  httpPost,
  interfaces,
  request,
  requestBody,
  requestHeaders,
  response,
} from 'inversify-express-utils';
import 'reflect-metadata';
import TYPES from '../container/types';
import {validate} from '../utils/request.utils';
import {IUserLogin, IUserRegister} from './user.dto';
import {UserService} from './user.service';
import Controller = interfaces.Controller;

const userRegistretionValidators = [
  check('email').isEmail(),
  check('login').isLength({min: 3}),
  check('password')
    .isLength({min: 5}).withMessage('Must be at least 5 chars long')
    .matches(/\d/).withMessage('Must contain a number'),
];

@controller('/users')
export class UserController implements Controller {

  constructor(
    @inject(TYPES.UserService) private userService: UserService,
  ) {
  }

  @httpPost('/login', validate([
    check('password').exists(),
    check('login').exists(),
  ]))
  public login(@response() res: express.Response,
               @requestBody() user?: IUserLogin) {
    return Promise.resolve()
      .then(() => this.userService.login(user))
      .then((result) => res.json(result));
  }

  @httpPost('/register',
    validate(userRegistretionValidators))
  public register(@response() res: express.Response,
                  @request() req: express.Request,
                  @requestBody() user?: IUserRegister) {
    return Promise.resolve()
      .then(() => this.userService.register(user))
      .then((result) => res.json(result));
  }

  @httpPost('/admin/register/',
    validate(userRegistretionValidators))
  public registerAdmin(@response() res: express.Response,
                       @request() req: express.Request,
                       @requestBody() user?: IUserRegister,
                       @requestHeaders('AdminSecret') adminSecret?: string) {
    return Promise.resolve()
      .then(() => this.userService.registerAdmin(user, adminSecret))
      .then((result) => res.json(result));
  }
}
