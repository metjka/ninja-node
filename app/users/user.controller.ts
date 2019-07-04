import {controller, httpPost, interfaces, requestBody, response} from 'inversify-express-utils';
import {Response} from 'express';

@controller('/user')
export class UserController implements interfaces.Controller {

  @httpPost('/login')
  public login(@response() res: Response,
               @requestBody() params?: {name: string, password: string}) {
    return res.json({huj: true});
  }

  @httpPost('/register')
  public register(@response() res: Response) {
    return res.json('zalupa');
  }


}
