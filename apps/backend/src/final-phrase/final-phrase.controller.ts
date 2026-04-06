import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { FinalPhraseService } from './final-phrase.service';
import { UnlockWordDto } from './dto/unlock-word.dto';

@Controller('final-phrase')
export class FinalPhraseController {
    constructor(private readonly finalPhraseService: FinalPhraseService) {}

    @Post('unlock')
    @Auth()
    unlock(@Req() req: Request, @Body() dto: UnlockWordDto) {
        const userId = (req as any).user.sub as number;
        return this.finalPhraseService.unlock(userId, dto);
    }
}
