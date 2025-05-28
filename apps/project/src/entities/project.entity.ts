import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";


export enum ProjectStatus{
    Initiated = 'initiated',
    OnGoing = 'ongoing',
    Completed = 'completed'
}
export enum ProjectPriority{
    High = 'high',
    Medium = 'medium',
    Low = 'low'
}

@Entity()
export class Project {

    @PrimaryGeneratedColumn("uuid")
    id:string

    @Column()
    title:string
    @Column()
    clientName:string

    @Column({type:'enum', enum:ProjectStatus, default:ProjectStatus.Initiated})
    status:ProjectStatus

    @Column({type:'enum', enum:ProjectPriority,default: ProjectPriority.High})
    priority:ProjectStatus

    @Column()
    startDate:Date

    @Column()
    endDate:Date
    
    @Column()
    budget:Number

    @Column()
    note:string

    tasks:Task[]

    @ManyToMany(() => Task)
    @JoinTable()
    dependencies: Task[];

}