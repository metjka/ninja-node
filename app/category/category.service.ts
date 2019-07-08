import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {ICategory, ICategoryModel} from './category.model';
import {Model} from 'mongoose';
import {ObjectId} from 'bson';
import {ClientError} from '../utils/request.utils';

@injectable()
export class CategoryService {

  constructor(
    @inject(TYPES.CategoryModel) private categoryModel: Model<ICategoryModel>
  ) {
  }

  public async getById(id: ObjectId): Promise<ICategory> {
    try {
      return await this.categoryModel.findById(id).lean().exec()
    } catch (e) {
      throw  new ClientError(`Cant get all categories! ${e}`)
    }
  }

  public async getAll(): Promise<ICategory[]> {
    try {
      return await this.categoryModel.find({}).lean().exec()
    } catch (e) {
      throw  new ClientError(`Cant get all categories! ${e}`)
    }
  }

  public async update(id: ObjectId, category: ICategory): Promise<ICategory> {
    try {
      return await this.categoryModel.updateOne({_id: id}, category).lean().exec();
    } catch (e) {
      throw  new ClientError(`Cant update category! ${e}`)
    }
  }

  public async create(category: ICategory): Promise<ICategory> {
    try {
      const categoryModel = await new this.categoryModel(category).save();
      return categoryModel.toJSON();
    } catch (e) {
      throw  new ClientError(`Cant create category! ${e}`)
    }
  }
}
