import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import * as jwt from 'jsonwebtoken';
import {Request} from 'express';
import {IConfig} from '../utils/interfaces/interfaces';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Config) private config: IConfig
  ) {
  }

  async getUser(token: string): Promise<any> {
    return jwt.verify(token, this.config.SECRET_KEY) as any;
  }
}
