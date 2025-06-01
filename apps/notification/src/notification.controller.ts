import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller()
export class AppController {
  constructor(private readonly appService: NotificationService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'OK',
      service: 'Notification Service',
      timestamp: new Date().toISOString(),
    };
  }
}