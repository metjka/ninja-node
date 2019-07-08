import {compareSync, hashSync} from 'bcryptjs';
import {inject, injectable} from 'inversify';
import {interfaces, TYPE} from 'inversify-express-utils';
import * as jwt from 'jsonwebtoken';
import {Model} from 'mongoose';
import TYPES from '../container/types';
import {IConfig} from '../utils/interfaces/interfaces';
import {ClientError, NotFoundError} from '../utils/request.utils';
import {IUserLogin, IUserRegister} from './user.dto';
import {IUserModel} from './user.model';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.Config) private config: IConfig,
    @inject(TYPES.UserModel) private userModel: Model<IUserModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext,
  ) {
  }

  public async login(user: IUserLogin) {
    try {
      const foundUser: IUserModel = await this.userModel.findOne({login: user.login}).lean().exec();
      if (!foundUser) {
        throw new NotFoundError(`User with login "${user.login}" was not found!`);
      }
      const isOk = compareSync(user.password, foundUser.password);
      if (!isOk) {
        throw new ClientError('Password is wrong!', 401);
      }
      return jwt.sign({
        _id: foundUser._id,
        roles: foundUser.roles,
        email: foundUser.email,
        fullName: foundUser.fullName || '',
      }, this.config.SECRET_KEY, {expiresIn: '2 days'});
    } catch (e) {
      throw new ClientError(`Cant login user! ${e}`, 401);
    }
  }

  public async register(user: IUserRegister): Promise<IUserModel> {
    try {
      const userWithSameEmail = await this.userModel.findOne({
        $or: [
          {email: user.email},
          {login: user.login},
        ],
      }, {_id: 1}).lean().exec();
      if (userWithSameEmail) {
        throw new ClientError(`User with email ${user.email} already exist!`);
      }
      user.password = hashSync(user.password);
      const savedUserModel = await new this.userModel({
        login: user.login,
        password: user.password,
        email: user.email,
        fullName: user.fullName,
      }).save();
      return savedUserModel.toJSON();
    } catch (e) {
      throw new ClientError(`Cant register user! ${e}`);
    }
  }

  public async registerAdmin(user: IUserRegister, adminSecret: string): Promise<IUserModel> {
    try {
      if (!adminSecret || adminSecret !== this.config.ADMIN_SECRET) {
        throw new ClientError('Cant register admin!');
      }
      const userWithSameEmail = await this.userModel.findOne({
        $or: [
          {email: user.email},
          {login: user.login},
        ],
      }, {_id: 1}).lean().exec();
      if (userWithSameEmail) {
        throw new ClientError(`User with email ${user.email} already exist!`);
      }
      user.password = hashSync(user.password);
      const savedUserModel = await new this.userModel({
        login: user.login,
        password: user.password,
        email: user.email,
        roles: ['admin'],
      }).save();
      return savedUserModel.toJSON();
    } catch (e) {
      throw new ClientError(`Cant register admin user! ${e}`);
    }
  }

  public async gerAdmins(): Promise<IUserModel[]> {
    return await this.userModel.find({roles: {$in: 'admin'}}).lean().exec();
  }
}
