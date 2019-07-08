import {interfaces} from 'inversify';
import {toLower} from 'lodash';
import {Connection, Document, Schema} from 'mongoose';
import TYPES from '../container/types';

const userSchema = new Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String},
  fullName: {type: String},
  createdAt: {type: Date, default: Date.now},
  roles: {type: [{type: String}], default: []},
  email: {
    type: String,
    set: toLower,
    validate: /[^@]+@[^.]+\..+/,
    required: true,
    unique: true,
  },
});

userSchema.set('toJSON', {
  transform: (doc, ret, o) => {
    delete ret.password;
  },
});

export function exportUserModel(context: interfaces.Context) {
  const mc: Connection = context.container.get(TYPES.MongoConnection);
  return mc.model('User', userSchema);
}

export interface IUserModel extends Document {
  name: string;
  password: string;
  email: string;
  fullName: string;
  roles: string;
}
