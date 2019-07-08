import {IProduct} from '../../product/product.model';

export interface IConfig {
  ADMIN_SECRET: string;
  PORT: string;
  MONGO_DB_NAME: string;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  MONGO_PORT: string;
  MONGO_HOST: string;
  SECRET_KEY: string;
  SMTP_HOST: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_PORT: number;
  SMTP_FROM: string;
}

export interface IBaseUser {
  _id: string | number;
  login: string;
  roles: string[];
}

export interface IReport {
  gained: number;
  soldProducts: Array<IProduct & {timesSold: number}>;
  topSeller: IProduct & {timesSold: number};
  time: string;
}
