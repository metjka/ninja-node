import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {Model} from 'mongoose';
import {IProduct, IProductModel} from './product.model';
import {interfaces, TYPE} from 'inversify-express-utils';
import {ObjectId, ObjectID} from 'mongodb';

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductModel) private productModel: Model<IProductModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext
  ) {
  }

  public async create(product: IProduct): Promise<IProduct> {
    const productModel: IProductModel = await new this.productModel(product).save();
    return productModel.toJSON();
  }

  public async getById(id: ObjectID): Promise<IProduct> {
    return await this.productModel
      .findById(id)
      .lean()
      .exec();
  }

  public async getAll(page = 0, categories: ObjectID[] = [], productTitle: string = ''): Promise<any> {
    const aggregations = [
      {
        $match: {
          category: {$in: categories},
          name: {$regex: productTitle}
        }
      },
      {
        $facet: {
          metadata: [
            {$count: 'count'},
            {$addFields: {page: page}}
          ],
          data: [
            {$skip: page * 10},
            {$limit: 10}
          ]
        }
      }
    ];
    return await this.productModel.aggregate(aggregations).exec();
  }

  public async update(id: ObjectId, product: IProduct): Promise<IProduct> {
    const updatedProduct: IProductModel = await this.productModel.updateOne({_id: id}, product).exec();
    return updatedProduct.toJSON();
  }
}
