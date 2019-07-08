import {Connection, Document, Schema} from 'mongoose';
import {interfaces} from 'inversify';
import TYPES from '../container/types';

const categorySchema = new Schema({
  name: {type: String, required: true}
});

export function exportCategoryModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('Category', categorySchema);
}

export interface ICategory {
  name: string;
}

export interface ICategoryModel extends Document {
}
