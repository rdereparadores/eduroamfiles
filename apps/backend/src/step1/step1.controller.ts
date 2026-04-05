import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { Step1Service } from './step1.service';
import { UnlockStep1Dto } from './dto/unlock-step1.dto';

@Controller('step1')
export class Step1Controller {
    constructor(private readonly step1Service: Step1Service) {}

    @Post('unlock')
    @Auth()
    unlock(@Req() req: Request, @Body() dto: UnlockStep1Dto) {
        const userId = (req as any).user.sub as number;
        return this.step1Service.unlock(userId, dto);
    }
}
