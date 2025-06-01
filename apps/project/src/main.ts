import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ProjectModule } from './project.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProjectModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('ProjectService');

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'project_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  logger.log('Project microservice is listening');
}
bootstrap();