import {inject, injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import TYPES from '../container/types';
import * as express from 'express';
import {AuthService} from './auth.service';
import * as _ from 'lodash';

export interface BaseUser {
  _id: string | number;
  login: string;
  roles: string[];
}

class Principal implements interfaces.Principal {
  public details: BaseUser;

  public constructor(details: any) {
    this.details = details;
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.resolve(!!this.details._id);
  }

  public isResourceOwner(resourceId: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  public isInRole(role: string): Promise<boolean> {
    return Promise.resolve(_.includes(this.details.roles, role));
  }
}

@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {

  @inject(TYPES.Auth) private readonly authService: AuthService;

  public async getUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<interfaces.Principal> {
    const token = this.authService.getToken(req);
    if (!token) {
      return new Principal({});
    }
    const user = await this.authService.getUser(token);
    const principal = new Principal(user);
    return principal;
  }

}
