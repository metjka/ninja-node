import {interfaces} from 'inversify-express-utils';
import * as _ from 'lodash';
import {IBaseUser} from '../utils/interfaces/interfaces';

export class UserPrincipal implements interfaces.Principal {
  public details: IBaseUser;

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
