import {inject, injectable} from "inversify";
import TYPES from "../container/types";
import {Model} from "mongoose";
import {IProductModel} from "./product.model";
import {interfaces, TYPE} from "inversify-express-utils";
import {ObjectID} from "mongodb";

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductModel) private productModel: Model<IProductModel>,
    @inject(TYPE.HttpContext) private httpContext: interfaces.HttpContext
  ) {
  }

  public create() {

  }

  public delete() {

  }

  public async getById(id: ObjectID): Promise<any> {
    const product = await this.productModel
      .findById(id)
      .lean().exec();
    return product;
  }

  public async getAll(page = 0, categories: ObjectID[] = [], productTitle: string = '') {
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
    const products = await this.productModel.aggregate(aggregations).exec();
    return products;
  }

}