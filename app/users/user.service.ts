import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {Config} from '../db/mongo';
import {UserModel} from './user.model';
import {Model} from 'mongoose';
import {compareSync, hashSync} from 'bcryptjs';
import {ClientError} from '../utils/request.utils';
import * as jwt from 'jsonwebtoken';
import {interfaces, TYPE} from 'inversify-express-utils';
import {UserLogin, UserRegister} from './user.dto';


@injectable()
export class UserService {
  constructor(
    @inject(TYPES.Config) private config: Config,
    @inject(TYPES.UserModel) private userModel: Model<UserModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext
  ) {
  }

  public async login(user: UserLogin) {
    const foundUser: any = await this.userModel.findOne({login: user.login}).lean().exec();
    if (!foundUser) {
      throw new ClientError(`user with login "${user.login}" was not found!`)
    }
    const isOk = compareSync(user.password, foundUser.password);
    if (!isOk) {
      throw new ClientError('Password is wrong!')
    }
    return jwt.sign({_id: foundUser._id}, this.config.SECRET_KEY, {expiresIn: '2 days'});
  }

  public async register(user: UserRegister): Promise<UserModel> {
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
    const savedUserModel = await new this.userModel(user).save();
    return savedUserModel.toJSON();
  }
}
