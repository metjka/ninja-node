import * as uuid from 'uuid';

export function userFactory(login: string) {
  return {
    login: `login ${uuid.v4()}`,
    email: `${uuid.v4()}@test.com`,
    password: uuid.v4()
  }
}
