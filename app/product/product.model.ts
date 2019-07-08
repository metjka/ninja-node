import {Connection, Document, Schema} from 'mongoose';
import {interfaces} from 'inversify';
import TYPES from '../container/types';
import {ObjectId} from 'bson';

const productSchema = new Schema({
  name: {type: String},
  imageURL: {type: String},
  price: {type: Number},
  description: {type: String},
  category: {type: Schema.Types.ObjectId, ref: `Category`, index: true}
});

export function exportProductModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('Product', productSchema);
}

export interface IProduct {
  _id: string,
  name: string;
  imageURL: string;
  price: number;
  description: string;
  category: string | ObjectId;
}

export interface IProductModel extends IProduct, Document {
  _id: string;
}
