import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {IUserModel} from './user.model';
import {Model} from 'mongoose';
import {compareSync, hashSync} from 'bcryptjs';
import {ClientError} from '../utils/request.utils';
import * as jwt from 'jsonwebtoken';
import {interfaces, TYPE} from 'inversify-express-utils';
import {UserLogin, UserRegister} from './user.dto';
import {IConfig} from '../utils/interfaces/interfaces';


@injectable()
export class UserService {
  constructor(
    @inject(TYPES.Config) private config: IConfig,
    @inject(TYPES.UserModel) private userModel: Model<IUserModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext
  ) {
  }

  public async login(user: UserLogin) {
    const foundUser: IUserModel = await this.userModel.findOne({login: user.login}).lean().exec();
    if (!foundUser) {
      throw new ClientError(`user with login "${user.login}" was not found!`)
    }
    const isOk = compareSync(user.password, foundUser.password);
    if (!isOk) {
      throw new ClientError('Password is wrong!')
    }
    return jwt.sign({
      _id: foundUser._id,
      roles: foundUser.roles,
      email: foundUser.email,
      fullName: foundUser.fullName || ''
    }, this.config.SECRET_KEY, {expiresIn: '2 days'});
  }

  public async register(user: UserRegister): Promise<IUserModel> {
    const userWithSameEmail = await this.userModel.findOne({
      $or: [
        {email: user.email},
        {login: user.login}
      ]
    }, {_id: 1}).lean().exec();
    if (userWithSameEmail) {
      throw new ClientError(`User with email ${user.email} already exist!`);
    }
    user.password = hashSync(user.password);
    const savedUserModel = await new this.userModel({
      login: user.login,
      password: user.password,
      email: user.email,
      fullName: user.fullName
    }).save();
    return savedUserModel.toJSON();
  }

  public async registerAdmin(user: UserRegister, adminSecret: string): Promise<IUserModel> {
    if (!adminSecret || adminSecret !== this.config.ADMIN_SECRET) {
      throw new ClientError('Cant register admin!')
    }
    const userWithSameEmail = await this.userModel.findOne({
      $or: [
        {email: user.email},
        {login: user.login}
      ]
    }, {_id: 1}).lean().exec();
    if (userWithSameEmail) {
      throw new ClientError(`User with email ${user.email} already exist!`);
    }
    user.password = hashSync(user.password);
    const savedUserModel = await new this.userModel({
      login: user.login,
      password: user.password,
      email: user.email,
      roles: ['admin']
    }).save();
    return savedUserModel.toJSON();
  }

  public async gerAdmins(): Promise<IUserModel[]> {
    return await this.userModel.find({'roles': {$in: 'admin'}}).lean().exec();
  }
}
