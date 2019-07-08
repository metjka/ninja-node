import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  queryParam,
  request,
  requestBody,
  requestParam,
  response
} from 'inversify-express-utils';
import {inject} from 'inversify';
import TYPES from '../container/types';
import {ProductService} from './product.service';
import {parseObjectId, validate} from '../utils/request.utils';
import * as express from 'express';
import {check, sanitizeQuery} from 'express-validator';
import * as _ from 'lodash';
import {IProduct} from './product.model';
import {constants} from 'http2';

const productValidation = [
  check('name').isLength({min: 3}),
  check('description').isLength({max: 300}),
  check('imageURL').isURL(),
  check('price').isDecimal(),
  check('category').exists(),
];

@controller('/products')
export class ProductController {

  constructor(
    @inject(TYPES.ProductService) private productService: ProductService,
  ) {
  }

  @httpGet('/:id')
  public async getById(@response() res: express.Response,
                       @request() req: express.Request,
                       @requestParam('id') productId: string) {
    const id = parseObjectId(productId);
    const product = await this.productService.getById(id);
    return res.json(product);
  }

  @httpGet('',
    sanitizeQuery('title').trim(),
    sanitizeQuery('page').toInt(10),
    sanitizeQuery('categories').toArray())
  public async getAll(@response() res: express.Response,
                      @request() req: express.Request,
                      @queryParam('page') page: number,
                      @queryParam('title') title: string,
                      @queryParam('categories') categories: string []) {
    const parsedPage = _.isNaN(page) ? 0 : page;
    const objectIds = categories ? categories.map(parseObjectId) : [];

    const products = await this.productService.getAll(parsedPage, objectIds, title.toLowerCase());
    return res.json(products);
  }

  @httpPost('/', TYPES.AuthMiddleware, TYPES.AdminMiddleware, validate(productValidation))
  public async create(@response() res: express.Response, @requestBody() product: IProduct) {
    product.category = parseObjectId(product.category);
    const newProduct = await this.productService.create(product);
    return res.status(constants.HTTP_STATUS_CREATED).json(newProduct);
  }

  @httpPut('/:id', TYPES.AuthMiddleware, TYPES.AdminMiddleware, validate(productValidation))
  public async update(@response() res: express.Response,
                      @requestParam('id') productId: string,
                      @requestBody() product: IProduct) {
    const id = parseObjectId(productId);
    const updatedProduct = await this.productService.update(id, product);
    return res.json(updatedProduct);
  }
}
