import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  
  findAll(){
    return "All users"
  }
}
