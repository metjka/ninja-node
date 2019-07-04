import {Container} from 'inversify';
import TYPES from './types';
import {MongoConnection} from '../db/mongo';
import {UserService} from '../users/user.service';
import {exportUserModel} from '../users/user.model';
import {AuthService} from '../auth/auth.service';
import {AuthMiddleware} from '../users/user.controller';
import {exportCategoryModel, exportProductModel} from "../product/product.model";

const config = require('../../config.json');

const container = new Container({defaultScope: 'Request'});

container.bind(TYPES.AuthMiddleware).to(AuthMiddleware);
container.bind(TYPES.Config).toConstantValue(config);
container.bind(TYPES.MongoConnection).toConstantValue(new MongoConnection(config).connection);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.UserModel).toDynamicValue(exportUserModel).inSingletonScope();
container.bind(TYPES.ProductModel).toDynamicValue(exportProductModel).inSingletonScope();
container.bind(TYPES.CategoryModel).toDynamicValue(exportCategoryModel).inSingletonScope();
container.bind(TYPES.Auth).to(AuthService).inSingletonScope();

export default container;
