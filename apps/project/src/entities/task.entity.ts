import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project.entity";

@Entity()
export class Task {
    @PrimaryGeneratedColumn("uuid")
    id:string
    @Column()
    title:string

    @Column()
    description:string

    @Column()
    project:Project
}