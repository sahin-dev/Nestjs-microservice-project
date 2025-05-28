import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  getHello(): string {
    return 'Hello World!';
  }

  createTask(projectId:string, createTaskDTo){

  }

  getAllTasks(){

  }

  getATask(){

  }

  updateTask(){

  }

  deleteTask(){

  }
}
