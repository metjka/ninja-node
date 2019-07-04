import 'mocha';
import app from '../app';
import * as supertest from 'supertest';
import {userFactory} from '../utils/test.utils';
import {isJWT} from 'validator';
import {expect} from 'chai'

describe('User controller integration test', () => {
  let api;
  let userNinja1;
  let userNinja1Token;
  let userNinja2;
  before(() => {
    api = supertest(app);
    userNinja1 = userFactory('Ninja 1');
    userNinja2 = userFactory('Ninja 2');
  });

  it('should register user and login', async () => {
    const registerResponse = await api.post('/api/user/register').send(userNinja1);

    expect(registerResponse.status).to.be.eq(200);
    userNinja1._id = registerResponse.body._id;

    const loginResponse = await api.post('/api/user/login').send(userNinja1);
    expect(loginResponse.status).to.be.eq(200);

    const isJwt = isJWT(loginResponse.body);
    expect(isJwt, 'should be jwt').to.be.eq(true);
    userNinja1Token = loginResponse.body;

    const securePongResponse = await api.get('/api/ping/sec').set({'Auth': userNinja1Token});
    expect(securePongResponse.status).to.be.eq(200);
    expect(securePongResponse.text).to.be.eq('secure pong');

    const securePongResponseWithoutToken = await api.get('/api/ping/sec');
    expect(securePongResponseWithoutToken.status).to.be.eq(401);

  });

  it('should not register users with same email', async () => {
    const response1 = await api.post('/api/user/register').send(userNinja2);
    const response2 = await api.post('/api/user/register').send(userNinja2);

    expect(response1.status).to.be.eq(200);
    expect(response2.status).to.be.eq(400);
  });
});
