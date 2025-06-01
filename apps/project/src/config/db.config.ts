import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { Task } from '../entities/task.entity';



export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  host: process.env.MONGO_URI || 'localhost',
  // port: parseInt(process.env.DB_PORT || '5433'),
  // username: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'nest',
  entities: [Project, Task],
  synchronize: true, // disable in production and use migrations
  autoLoadEntities: true,
};
