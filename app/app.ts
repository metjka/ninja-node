import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import {InversifyExpressServer} from 'inversify-express-utils';
import * as  schedule from 'node-schedule';
import {CustomAuthProvider} from './auth/auth.provider';
import './category/category.controller';
import container from './container/container';
import TYPES from './container/types';
import './order/order.controller';
import './ping/ping.controller';
import './product/product.controller';
import './users/user.controller';
import {IConfig} from './utils/interfaces/interfaces';
import {sendReport} from './utils/report.utils';
import {errorHandler} from './utils/request.utils';

const server = new InversifyExpressServer(container, null, {rootPath: '/api'}, null, CustomAuthProvider);

const config: IConfig = container.get(TYPES.Config);
server.setConfig((appToConfig) => {
  appToConfig.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  appToConfig.use(bodyParser.urlencoded({extended: true}));
  appToConfig.use(bodyParser.json());
});
server.setErrorConfig(errorHandler);

const app = server.build();

schedule.scheduleJob('* * 8 * * *', async () => {
  await sendReport(config);
});

const instance = app.listen(config.PORT, (err) => {
  if (err) {
    console.log(`Error occurred: ${err}`);
  }
  console.log(`Server started on port ${config.PORT} :)`);
});
export default app;
