import {controller, httpGet, httpPost, httpPut, requestBody, requestParam, response} from 'inversify-express-utils';
import {inject} from 'inversify';
import TYPES from '../container/types';
import {CategoryService} from './category.service';
import * as express from 'express';
import {ICategory} from './category.model';
import {parseObjectId} from '../utils/request.utils';

@controller('/categories')
export class CategoryController {

  constructor(
    @inject(TYPES.CategoryService) private categoryService: CategoryService
  ) {
  }

  @httpPost('/', TYPES.AuthMiddleware, TYPES.AdminMiddleware)
  public async create(@response() res: express.Response,
                      @requestBody() category: ICategory) {
    const newCategory = await this.categoryService.create(category);
    return res.status(201).json(newCategory);
  }

  @httpPut('/:id', TYPES.AuthMiddleware, TYPES.AdminMiddleware)
  public async update(@response() res: express.Response,
                      @requestBody() category: ICategory,
                      @requestParam('id') categoryId: string
  ) {
    const id = parseObjectId(categoryId);
    await this.categoryService.update(id, category);
  }

  @httpGet('/:id')
  public async getById(@response() res: express.Response,
                       @requestParam('id') categoryId: string
  ) {
    const id = parseObjectId(categoryId);
    const category = await this.categoryService.getById(id);
    return res.json(category);
  }

  @httpGet('/')
  public async getAll(@response() res: express.Response) {
    const categories = await this.categoryService.getAll();
    return res.json(categories)
  }

}
