import 'reflect-metadata';
import './users/user.controller';
import {InversifyExpressServer} from 'inversify-express-utils';
import {Container} from 'inversify';
import * as bodyParser from 'body-parser';
import TYPES from './constant/types';
import {UserService} from "./users/user.service";

// load everything needed to the Container
let container = new Container();
container.bind<UserService>(TYPES.UserService).to(UserService);

// start the server
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
});

const app = server.build();
let instance = app.listen(3000, () => {
  console.log('Server started on port 3000 :)');
});

export default app;
