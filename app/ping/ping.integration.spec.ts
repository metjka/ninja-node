import 'mocha';
import * as supertest from 'supertest';
import app from '../app';
import {cleanUpMetadata} from 'inversify-express-utils';

const expect = require('chai').expect;

describe('Ping integration test', () => {
  let api;
  before(() => {
    api = supertest(app);
  });

  beforeEach(() => {
    cleanUpMetadata();
  });

  it('should pong', async () => {
    const response = await api.get('/api/ping');
    expect(response.status).to.be.eq(200);
    expect(response.text).to.be.eq('pong');
  });
});
