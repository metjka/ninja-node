import {Connection, Document, Schema} from "mongoose";
import {interfaces} from "inversify";
import TYPES from "../container/types";

const categorySchema = new Schema({
  name: {type: String, required: true}
});

const productSchema = new Schema({
  name: {type: String},
  imageURL: {type: String},
  price: {type: String},
  description: {type: String},
  category: {type: Schema.Types.ObjectId, ref: `Category`, index: true}
});

export function exportProductModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('Product', productSchema);
}

export function exportCategoryModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('Category', categorySchema);
}


export interface IProductModel extends Document {
  _id: string;
  name: string;
  imageURL: string;
  price: string;
  description: string;
  category: string;
}