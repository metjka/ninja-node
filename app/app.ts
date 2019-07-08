import 'reflect-metadata';
import './users/user.controller';
import './ping/ping.controller';
import './product/product.controller';
import './category/category.controller';
import './order/order.controller';
import {InversifyExpressServer} from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import container from './container/container';
import TYPES from './container/types';
import {errorHandler} from './utils/request.utils';
import {CustomAuthProvider} from './auth/auth.provider';
import {IConfig} from './utils/interfaces/interfaces';
import * as  schedule from 'node-schedule';
import {sendReport} from './utils/report.utils';

const server = new InversifyExpressServer(container, null, {rootPath: '/api'}, null, CustomAuthProvider);

const config: IConfig = container.get(TYPES.Config);
server.setConfig((app) => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
  });
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
});
server.setErrorConfig(errorHandler);

const app = server.build();

schedule.scheduleJob('* * 8 * * *', async () => {
  await sendReport(config);
});

let instance = app.listen(config.PORT, (err) => {
  if (err) {
    console.log(`Error occurred: ${err}`);
  }
  console.log(`Server started on port ${config.PORT} :)`);
});
export default app;
