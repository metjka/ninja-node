import 'mocha';
import app from '../app';
import * as supertest from 'supertest';
import {clearDb, registerAndLoginAdmin, registerAndLoginUser, userFactory} from '../utils/test.utils';
import {IProduct} from './product.model';
import {expect} from 'chai'
import * as _ from 'lodash';
import {cleanUpMetadata} from 'inversify-express-utils';

describe('Product controller integration test', () => {
  let api;
  let userNinjaAdmin;
  let userNinjaUser;
  let ninjaAdminToken;
  let ninjaUserToken;
  let weaponCategory;

  before(async () => {
    api = supertest(app);
    userNinjaAdmin = userFactory('Ninja admin');
    userNinjaUser = userFactory('Ninja user');
    const adminResponse = (await registerAndLoginAdmin(api, userNinjaAdmin, 'ioeuqoieqwoieuqwoi'));
    const userResponse = (await registerAndLoginUser(api, userNinjaUser));
    ninjaAdminToken = adminResponse.body;
    ninjaUserToken = userResponse.body;
  });

  beforeEach(() => {
    cleanUpMetadata();
  });

  it('should create new product', async () => {
    const createCategoryResponse = await api.post('/api/categories').send({name: 'Weapon'}).set('Auth', ninjaAdminToken);
    expect(createCategoryResponse.status).to.be.eq(201);
    expect(createCategoryResponse.body.name).to.be.eq('Weapon');
    weaponCategory = createCategoryResponse.body;

    const createShurikenResponse = await api.post('/api/products').send({
      name: 'Shuriken',
      imageURL: 'http://www.ninjaencyclopedia.com/img/shuriken_cross1-sum.jpg',
      category: weaponCategory._id,
      description: 'Originally, the function of shuriken was for self-defense. It is said that the mold of the shuriken was small knives or big nails.',
      price: 2.90,
    } as IProduct)
      .set('Auth', ninjaAdminToken);
    const createKusarigamaResponse = await api.post('/api/products').send({
      name: 'Kusarigama',
      imageURL: 'http://www.ninjaencyclopedia.com/img/shuriken_cross1-sum.jpg',
      category: weaponCategory._id,
      description: 'Kusarigama is a weapon that has a sickle and a weight and looks very complex. They are connected with a chain. ',
      price: 50.99,
    } as IProduct)
      .set('Auth', ninjaAdminToken);
    const createSwordResponse = await api.post('/api/products').send({
      name: 'Sword',
      imageURL: 'http://www.ninjaencyclopedia.com/img/shuriken_cross1-sum.jpg',
      category: weaponCategory._id,
      description: 'Ninja swordSamurai SwordThe swords considered to be those used by ninjas are quite specific. ',
      price: 44.99,
    } as IProduct)
      .set('Auth', ninjaAdminToken);

    const weapons = [createShurikenResponse, createKusarigamaResponse, createSwordResponse];
    weapons.forEach((weaponResponse) => {
      return expect(weaponResponse.status).to.be.eq(201);
    });

    const getShurikenResponse = await api.get(`/api/products/${createShurikenResponse.body._id}`);
    expect(getShurikenResponse.status).to.be.eq(200);
    expect(getShurikenResponse.body.name).to.be.eq('Shuriken');
    expect(getShurikenResponse.body.category).to.be.eq(weaponCategory._id);
    expect(getShurikenResponse.body.price).to.satisfy(_.isNumber);
  });

  it('should refuse to create new category as non admin', async () => {
    const createCategoryResponse = await api.post('/api/categories').send({name: 'Weapon'}).set('Auth', ninjaUserToken);
    expect(createCategoryResponse.status).to.be.eq(403);
  });

  it('should refuse to create new product as non admin', async () => {
    const createCategoryResponse = await api.post('/api/products').send({name: 'Weapon'}).set('Auth', ninjaUserToken);
    expect(createCategoryResponse.status).to.be.eq(403);
  });


  after(clearDb)
});
