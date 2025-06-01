import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
    envFilePath: '.env',
  }),
    TypeOrmModule.forRootAsync({
    useFactory: async () => ({
      type: 'mongodb',
      url: process.env.MONGO_URI,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}']
    })
  }),
  MongooseModule.forFeature([
    {
      name: User.name, 
      schema: UserSchema
  }]),
  ClientsModule.registerAsync([
    {
      name: 'NOTIFICATION_SERVICE',
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService:ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL') as string],
          queue: configService.get<string>('NOTIFICATION_QUEUE'),
          queueOptions: {
            durable: true,
          },
        },
      }),
    },
  ]),
],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
