import 'mocha';
import app from "../app";
import * as supertest from "supertest";
const expect = require('chai').expect;

describe('User controller integration test', () => {
  let api;
  before(() => {
    api = supertest(app);
  });
  it('should check user controller', async () => {
    const {body, status} = await api.post('/user/login')
      .send({});
    expect(status).to.be.eq(200);
  });
});
