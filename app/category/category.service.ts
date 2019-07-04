import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import {ICategory, ICategoryModel} from './category.model';
import {Model} from 'mongoose';
import {ObjectId} from 'bson';

@injectable()
export class CategoryService {

  constructor(
    @inject(TYPES.CategoryModel) private categoryModel: Model<ICategoryModel>
  ) {
  }

  public async getById(id: ObjectId): Promise<ICategory> {
    return await this.categoryModel.findById(id).lean().exec()
  }

  public async getAll(): Promise<ICategory[]> {
    return await this.categoryModel.find({}).lean().exec()
  }

  public async update(id: ObjectId, category: ICategory): Promise<ICategory> {
    return await this.categoryModel.updateOne({_id: id}, category).lean().exec();
  }

  public async create(category: ICategory): Promise<ICategory> {
    const categoryModel = await new this.categoryModel(category).save();
    return categoryModel.toJSON();
  }
}
