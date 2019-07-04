import 'mocha';
import app, {sendReport} from '../app';
import * as supertest from 'supertest';
import {clearDb, registerAndLoginAdmin, registerAndLoginUser, userFactory} from '../utils/test.utils';
import {expect} from 'chai'
import {IProduct} from '../product/product.model';
import {cleanUpMetadata} from 'inversify-express-utils';

describe('Order controller integration test', () => {
  let api;
  let userNinjaAdmin;
  let userNinjaUser;
  let ninjaAdminToken;
  let ninjaUserToken;

  beforeEach(() => {
    cleanUpMetadata();
  });

  before(async () => {
    api = supertest(app);
    userNinjaAdmin = userFactory('Ninja admin');
    userNinjaUser = userFactory('Ninja user');
    const adminResponse = (await registerAndLoginAdmin(api, userNinjaAdmin, 'ioeuqoieqwoieuqwoi'));
    const userResponse = (await registerAndLoginUser(api, userNinjaUser));
    ninjaAdminToken = adminResponse.body;
    ninjaUserToken = userResponse.body;
  });


  it('should create new order', async () => {
    const createCategoryResponse = await api.post('/api/categories').send({name: 'Weapon'}).set('Auth', ninjaAdminToken);
    expect(createCategoryResponse.status).to.be.eq(201);
    expect(createCategoryResponse.body.name).to.be.eq('Weapon');
    const weaponCategory = createCategoryResponse.body;
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

    const orderResponse1 = await api.post('/api/orders').set('Auth', ninjaUserToken).send({
      orderPositions: [
        {
          number: 5,
          item: createShurikenResponse.body._id
        }, {
          number: 10,
          item: createKusarigamaResponse.body._id
        }
      ]
    } as {orderPositions: {number: number, item: string}[]});
    const orderResponse2 = await api.post('/api/orders').set('Auth', ninjaUserToken).send({
      orderPositions: [
        {
          number: 5,
          item: createShurikenResponse.body._id
        }, {
          number: 10,
          item: createKusarigamaResponse.body._id
        }
      ]
    } as {orderPositions: {number: number, item: string}[]});

    expect(orderResponse1.status).to.be.eq(201);
    expect(orderResponse1.body.total, '2.9*5+50.99*10').to.be.eq(524.4);
    expect(orderResponse2.status).to.be.eq(201);
    expect(orderResponse2.body.total, '2.9*5+50.99*10').to.be.eq(524.4);
  });

  it('should all orders for admin', async () => {
    const ordersResponse = await api.get('/api/orders').set('Auth', ninjaAdminToken);
    expect(ordersResponse.status).to.be.eq(200);
  });

  it('should refuse ot get all orders as non admin', async () => {
    const ordersResponse = await api.get('/api/orders').set('Auth', ninjaUserToken);
    expect(ordersResponse.status).to.be.eq(403);
  });

  it('should get report for admin', async () => {
    const ordersResponse = await api.get('/api/orders/report').set('Auth', ninjaAdminToken);
    expect(ordersResponse.status).to.be.eq(200);
  });

  it('should send report email', async () => {
    await sendReport()
  });
  after(clearDb)
});
