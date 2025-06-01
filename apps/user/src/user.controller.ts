// import { Controller, Get } from '@nestjs/common';
// import { UsersService } from './user.service';
// import { MessagePattern } from '@nestjs/microservices';

// @Controller()
// export class UserController {
//   constructor(private readonly userService: UsersService) {}

//   @MessagePattern("users.findAll")
//   findAll ()
//   {
//     return this.userService.findAll()
//   }
// }


import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './user.service';
import { CreateUserDto } from '../new-dto/create-user.dto';
import { UpdateUserDto } from '../new-dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'find_all_users' })
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern({ cmd: 'find_user_by_id' })
  findById(@Payload() id: string) {
    return this.usersService.findById(id);
  }

  @MessagePattern({ cmd: 'find_user_by_email' })
  findByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'update_user' })
  update(@Payload() data: { id: string; updateUserDto: UpdateUserDto }) {
    return this.usersService.update(data.id, data.updateUserDto);
  }

  @MessagePattern({ cmd: 'remove_user' })
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern({ cmd: 'find_users_by_skills' })
  findBySkills(@Payload() skills: string[]) {
    return this.usersService.findBySkills(skills);
  }

  @MessagePattern({ cmd: 'validate_user' })
  validateUser(@Payload() data: { email: string; password: string }) {
    return this.usersService.validateUser(data.email, data.password);
  }
}