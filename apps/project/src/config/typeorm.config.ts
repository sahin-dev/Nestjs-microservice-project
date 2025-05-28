import { TypeOrmModuleOptions } from '@nestjs/typeorm';



export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'project_management_db',
  entities: [],
  synchronize: true, // disable in production and use migrations
  autoLoadEntities: true,
};
