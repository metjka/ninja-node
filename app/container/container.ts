import {Container} from 'inversify';
import TYPES from './types';
import {MongoConnection} from '../db/mongo';
import {UserService} from '../users/user.service';
import {exportUserModel} from '../users/user.model';
import {AuthService} from '../auth/auth.service';
import {exportProductModel} from '../product/product.model';
import {AuthMiddleware} from '../auth/auth.middleware';
import {exportCategoryModel} from '../category/category.model';
import {AdminMiddleware} from '../auth/admin.middleware';
import {ProductService} from '../product/product.service';
import {CategoryService} from '../category/category.service';
import {OrderService} from '../order/order.service';
import {exportOrderModel} from '../order/order.model';
import {MailService} from '../mail/mail.service';

const config = require('../../config.json');

const container = new Container({defaultScope: 'Request'});

container.bind(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind(TYPES.AdminMiddleware).to(AdminMiddleware);
container.bind(TYPES.AuthMiddleware).to(AuthMiddleware);

container.bind(TYPES.Config).toConstantValue(config);

container.bind(TYPES.MongoConnection).toConstantValue(new MongoConnection(config).connection);

container.bind(TYPES.UserModel).toDynamicValue(exportUserModel).inSingletonScope();
container.bind(TYPES.ProductModel).toDynamicValue(exportProductModel).inSingletonScope();
container.bind(TYPES.OrderModel).toDynamicValue(exportOrderModel).inSingletonScope();
container.bind(TYPES.CategoryModel).toDynamicValue(exportCategoryModel).inSingletonScope();

container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.ProductService).to(ProductService);
container.bind(TYPES.CategoryService).to(CategoryService);
container.bind(TYPES.OrderService).to(OrderService);
container.bind(TYPES.MailService).to(MailService).inSingletonScope();

export default container;
