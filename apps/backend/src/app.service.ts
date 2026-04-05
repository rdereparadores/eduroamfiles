import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

// reload 1
// reload 2
// reload 3
// r1
// r2
// r3
