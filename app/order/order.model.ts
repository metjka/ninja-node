import {interfaces} from 'inversify';
import * as _ from 'lodash';
import {Connection, Document, Schema} from 'mongoose';
import TYPES from '../container/types';

const oneItem = new Schema({
  number: {type: Number, required: true},
  productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
  price: {type: Number, required: true},
}, {_id: false, id: false});

oneItem.virtual('totalPrice')
  .get(function() {
    const totalPrice = _.toNumber(_.multiply(this.number, this.price).toFixed(2));
    return totalPrice;
  });

oneItem.set('toJSON', {
  virtuals: true,
});


const orderSchema = new Schema({
  orderPositions: {type: [oneItem]},
  orderedBy: {type: Schema.Types.ObjectId, ref: 'User', index: true, required: true},
  createdAt: {type: Date, default: Date.now},
});

orderSchema.virtual('total').get(function() {
  const total = this.orderPositions.map((item) => item.totalPrice).reduce((acc, val) => _.add(acc, val), 0);
  return total;
});

orderSchema.set('toJSON', {
  virtuals: true, transform: (doc, ret, options) => {
    delete ret._v;
  },
});

export function exportOrderModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('Order', orderSchema);
}

export interface IOrderModel extends Document {
  orderPositions: Array<{
    number: number
    productId: string
    price: number,
    totalPrice?: number,
  }>;
  orderedBy: string;
  createdAt: Date;
  total: number;
}
