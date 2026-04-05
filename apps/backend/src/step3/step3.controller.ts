import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { AddContactDto } from './dto/add-contact.dto';
import { Step3Service } from './step3.service';

@Controller('step3')
export class Step3Controller {
    constructor(private readonly step3Service: Step3Service) {}

    @Post('add-contact')
    @Auth()
    addContact(@Req() req: Request, @Body() dto: AddContactDto) {
        const userId = (req as any).user.sub as number;
        return this.step3Service.addContact(userId, dto);
    }
}
