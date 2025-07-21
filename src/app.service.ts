import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  getHealth(): { status: string } {
    this.logger.log('Getting application health', AppService.name);
    return { status: 'Active' };
  }
}
