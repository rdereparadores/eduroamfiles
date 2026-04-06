import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { Step5Service } from './step5.service';
import { UnlockFolderDto } from './dto/unlock-folder.dto';

@Controller('step5')
export class Step5Controller {
    constructor(private readonly step5Service: Step5Service) {}

    @Post('unlock')
    @Auth()
    unlock(@Req() req: Request, @Body() dto: UnlockFolderDto) {
        const userId = (req as any).user.sub as number;
        return this.step5Service.unlock(userId, dto);
    }
}
