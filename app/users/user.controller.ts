import 'reflect-metadata';
import * as express from 'express';
import {
  controller,
  httpPost,
  interfaces,
  request,
  requestBody,
  requestHeaders,
  response
} from 'inversify-express-utils';
import {inject} from 'inversify';
import TYPES from '../container/types';
import {UserService} from './user.service';
import {check} from 'express-validator';
import {validate} from '../utils/request.utils';
import {UserLogin, UserRegister} from './user.dto';
import Controller = interfaces.Controller;

const userRegistretionValidators = [
  check('email').isEmail(),
  check('login').isLength({min: 3}),
  check('password')
    .isLength({min: 5}).withMessage('Must be at least 5 chars long')
    .matches(/\d/).withMessage('Must contain a number')
];

@controller('/users')
export class UserController implements Controller {

  constructor(
    @inject(TYPES.UserService) private userService: UserService,
  ) {
  }

  @httpPost('/login', validate([
    check('password').exists(),
    check('login').exists()
  ]))
  public login(@response() res: express.Response,
               @requestBody() user?: UserLogin) {
    return Promise.resolve()
      .then(() => this.userService.login(user))
      .then(result => res.json(result));
  }

  @httpPost('/register',
    validate(userRegistretionValidators))
  public register(@response() res: express.Response,
                  @request() req: express.Request,
                  @requestBody() user?: UserRegister) {
    return Promise.resolve()
      .then(() => this.userService.register(user))
      .then(result => res.json(result));
  }

  @httpPost('/admin/register/',
    validate(userRegistretionValidators))
  public registerAdmin(@response() res: express.Response,
                       @request() req: express.Request,
                       @requestBody() user?: UserRegister,
                       @requestHeaders('AdminSecret') adminSecret?: string) {
    return Promise.resolve()
      .then(() => this.userService.registerAdmin(user, adminSecret))
      .then(result => res.json(result));
  }
}
