import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('NotificationService');

  // Connect as microservice using RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Connect to event bus for subscribing to events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'event_bus',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  
  const port = configService.get('PORT') || 3004;
  await app.listen(port);
  
  logger.log(`Notification Service is running on port ${port}`);
  logger.log('Notification Microservice is listening');
}

bootstrap();