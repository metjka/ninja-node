import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {Config} from '../db/mongo';
import * as jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';
import {BadTokenError} from '../utils/request.utils';


@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Config) private config: Config
  ) {

  }

  public validate(req: Request, res: Response, next: NextFunction): void {
    const token = this.getToken(req);
    if (!token) {
      return next(new BadTokenError('Token not found!'));
    }
    const verify = jwt.verify(token, this.config.SECRET_KEY) as any;
    if (!verify) {
      return next(new BadTokenError('Wrong token!'));
    }
    (req as any).user = {_id: verify._id};
    return next();
  }

  public getToken(req: Request): string {
    return req.get('Auth');
  }

  async getUser(token: string): Promise<any> {
      const verify = jwt.verify(token, this.config.SECRET_KEY) as any;
      return verify;
  }
}
