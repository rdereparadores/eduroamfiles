import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { Step2Service } from './step2.service';

@Controller('step2')
export class Step2Controller {
    constructor(private readonly step2Service: Step2Service) {}

    @Post('url-accessed')
    @Auth()
    urlAccessed(@Req() req: Request) {
        const userId = (req as any).user.sub as number;
        return this.step2Service.urlAccessed(userId);
    }
}
