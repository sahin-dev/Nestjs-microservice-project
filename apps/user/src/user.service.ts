// import { Injectable } from '@nestjs/common';
// import { MongoRepository } from 'typeorm';
// import { User } from '../entities/user.entity';
// import { CreateUserDto } from '../dtos/create-user.dto';

// @Injectable()
// export class UserService {
  
//   constructor(private readonly userRepository: MongoRepository<User>) {}

//   async create(user: CreateUserDto): Promise<User> {
//     return this.userRepository.save(user as any as Partial<User>);
//   }
//   findAll(){
//     return "All users"
//   }
// }


import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/user.repository'
import { CreateUserDto } from '../new-dto/create-user.dto';
import { UpdateUserDto } from '../new-dto/update-user.dto';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    return this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.usersRepository.remove(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async findBySkills(skills: string[]): Promise<User[]> {
    return this.usersRepository.findBySkills(skills);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        await this.usersRepository.updateLastLogin(user.id);
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}