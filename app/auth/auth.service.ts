import {Request} from 'express';
import {inject, injectable} from 'inversify';
import * as jwt from 'jsonwebtoken';
import TYPES from '../container/types';
import {IConfig} from '../utils/interfaces/interfaces';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Config) private config: IConfig,
  ) {
  }

  public async getUser(token: string): Promise<any> {
    return jwt.verify(token, this.config.SECRET_KEY) as any;
  }
}
