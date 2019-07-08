import * as express from 'express';
import {inject} from 'inversify';
import {controller, httpGet, httpPost, httpPut, requestBody, requestParam, response} from 'inversify-express-utils';
import TYPES from '../container/types';
import {parseObjectId} from '../utils/request.utils';
import {ICategory} from './category.model';
import {CategoryService} from './category.service';

@controller('/categories')
export class CategoryController {

  constructor(
    @inject(TYPES.CategoryService) private categoryService: CategoryService,
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
                      @requestParam('id') categoryId: string,
  ) {
    const id = parseObjectId(categoryId);
    await this.categoryService.update(id, category);
  }

  @httpGet('/:id')
  public async getById(@response() res: express.Response,
                       @requestParam('id') categoryId: string,
  ) {
    const id = parseObjectId(categoryId);
    const category = await this.categoryService.getById(id);
    return res.json(category);
  }

  @httpGet('/')
  public async getAll(@response() res: express.Response) {
    const categories = await this.categoryService.getAll();
    return res.json(categories);
  }

}
