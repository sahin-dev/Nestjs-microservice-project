import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


enum UserRole {
    Admin = 'admin',
    Developer = 'developer'
}

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column()
    name:string
    @Column()
    email:String

    @Column()
    password:string

    @Column({type:'enum', enum:UserRole})
    role:UserRole

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
    created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
    updated_at!: Date;

    
}
