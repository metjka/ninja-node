import 'mocha';
import * as supertest from 'supertest';
import app from '../app';
const expect = require('chai').expect;

describe('Ping integration test', () => {
  let api;
  before(() => {
    api = supertest(app);
  });

  it('should pong', async () => {
    const response = await api.get('/ping');
    expect(response.status).to.be.eq(200);
    expect(response.text).to.be.eq('pong');
  });
});
