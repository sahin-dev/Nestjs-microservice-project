import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userServie:UsersService){}

    @Get()
    findAll(){  
        return this.userServie.findAll()
    }   
}
