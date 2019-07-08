import {inject, injectable} from 'inversify';
import {interfaces, TYPE} from 'inversify-express-utils';
import * as _ from 'lodash';
import {ObjectId, ObjectID} from 'mongodb';
import {Model} from 'mongoose';
import * as int32 from 'mongoose-int32';
import TYPES from '../container/types';
import {NotFoundError} from '../utils/request.utils';
import {IProduct, IProductModel} from './product.model';

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductModel) private productModel: Model<IProductModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext,
  ) {
  }

  public async create(product: IProduct): Promise<IProduct> {
    const productModel: IProductModel = await new this.productModel(product).save();
    return productModel.toJSON();
  }

  public async getById(id: ObjectID): Promise<IProduct> {
    const product = await this.productModel
      .findById(id)
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundError(`Product with id ${id.toHexString()} was not found!`);
    }
    return product;
  }

  public async getAll(page = 0, categories: ObjectID[] = [], productTitle: string = ''): Promise<any> {
    const matchers: any = [
      {name: {$regex: productTitle, $options: 'i'}},
    ];
    if (categories && categories.length) {
      matchers.push({category: {$in: categories}});
    }
    const aggregations = [
      {
        $match: {
          $and: matchers,
        },
      },
      {
        $facet: {
          metadata: [
            {$count: 'count'},
            {$addFields: {page: int32.cast(page)}},
          ],
          data: [
            {$skip: page * 10},
            {$limit: 10},
          ],
        },
      },
      {
        $unwind: {
          path: '$metadata',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    return await this.productModel.aggregate(aggregations).exec()
      .then((res) => {
        const head: any = _.head(res);
        head.metadata = head.metadata || {count: 0, page: 0};
        return head;
      });
  }

  public async update(id: ObjectId, product: IProduct): Promise<IProduct> {
    const updatedProduct: IProductModel = await this.productModel.updateOne({_id: id}, product).exec();
    if (!updatedProduct) {
      throw new NotFoundError(`Product with id ${id.toHexString()} was not found!`);
    }
    return updatedProduct.toJSON();
  }
}
