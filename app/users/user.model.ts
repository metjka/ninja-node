import {Connection, Document, Schema} from 'mongoose';
import {interfaces} from 'inversify';
import TYPES from '../container/types';
import {toLower} from 'lodash';

const userSchema = new Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String},
  email: {
    type: String,
    set: toLower,
    validate: /[^@]+@[^.]+\..+/,
    required: true,
    unique: true
  }
});

export function exportUserModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('User', userSchema);
}

export interface UserModel extends Document {
  name: string;
  password: string;
  email: string;
}
