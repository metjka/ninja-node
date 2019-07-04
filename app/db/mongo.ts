import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import TYPES from '../container/types';
import * as mongoose from 'mongoose';
import {Connection, Mongoose} from 'mongoose';
import {IConfig} from '../utils/interfaces/interfaces';


@injectable()
export class MongoConnection {

  private client: Mongoose;
  private readonly _connection: Connection;

  constructor(@inject(TYPES.Config) private config: IConfig) {
    const uri = `mongodb://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB_NAME}?compressors=zlib`;
    this.client = mongoose;
    this.client.connect(uri, {useNewUrlParser: true, useCreateIndex: true});
    this._connection = this.client.connection;
    this._connection.on('error', (err) => {
      console.log('Error uncured!' + JSON.stringify(err));
      process.exit(1)
    });
    this.connection.once('open', () => console.info(`Connected to Mongo`));

  }

  public get connection(): Connection {
    return this._connection;
  }
}

