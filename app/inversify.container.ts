import 'app/users/user.controller';
import {Container} from "inversify";
import TYPES from "./constant/types";
import {UserService} from "./users/user.service";

const container = new Container({defaultScope: "Request"});

container.bind(TYPES.UserService).to(UserService);
