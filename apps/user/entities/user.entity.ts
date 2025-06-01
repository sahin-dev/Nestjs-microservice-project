import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';


export enum UserRole {
    Admin = 'admin',
    Manageer = 'manager',
    Developer = 'developer'
}
// apps/user/src/entities/user.entity.ts


@Entity()
export class User extends Document {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}

