import {inject, injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import TYPES from '../container/types';
import * as express from 'express';
import {AuthService} from './auth.service';
import {UserPrincipal} from './user.principal';

@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {

  @inject(TYPES.AuthService) private readonly authService: AuthService;

  public async getUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<interfaces.Principal> {
    const token = this.authService.getToken(req);
    if (!token) {
      return new UserPrincipal({});
    }
    try {
      const user = await this.authService.getUser(token);
      const principal = new UserPrincipal(user);
      return principal;
    } catch (e) {
      return new UserPrincipal({});
    }
  }

}
