import * as uuid from 'uuid';
import {ICategoryModel} from '../category/category.model';
import container from '../container/container';
import TYPES from '../container/types';
import {IOrderModel} from '../order/order.model';
import {IProductModel} from '../product/product.model';
import {IUserModel} from '../users/user.model';

export function userFactory(login: string) {
  return {
    fullName: login,
    login: `${login}-${uuid.v4()}`,
    email: `${uuid.v4()}@test.com`,
    password: uuid.v4(),
  };
}

export function registerAndLoginUser(api, user) {
  return Promise.resolve()
    .then(() => api.post('/api/users/register').send(user))
    .then(() => api.post('/api/users/login').send(user));
}

export function registerAndLoginAdmin(api, user, adminSecret: string) {
  return Promise.resolve()
    .then(() => api.post('/api/users/admin/register/').send(user).set('AdminSecret', adminSecret))
    .then(() => api.post('/api/users/login').send(user));
}

export const clearDb = async () => {
  const UserModel = container.get<IUserModel>(TYPES.UserModel);
  const CategoryModel = container.get<ICategoryModel>(TYPES.CategoryModel);
  const ProductModel = container.get<IProductModel>(TYPES.ProductModel);
  const OrderModel = container.get<IOrderModel>(TYPES.OrderModel);
  await UserModel.collection.drop()
    .catch((err) => console.log(`${UserModel.collection.collectionName} doesn't exist`));
  await CategoryModel.collection.drop()
    .catch((err) => console.log(`${CategoryModel.collection.collectionName} doesn't exist`));
  await ProductModel.collection.drop()
    .catch((err) => console.log(`${ProductModel.collection.collectionName} doesn't exist`));
  await OrderModel.collection.drop()
    .catch((err) => console.log(`${OrderModel.collection.collectionName} doesn't exist`));
};
