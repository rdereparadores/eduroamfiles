import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { Step3Controller } from './step3.controller';
import { Step3Service } from './step3.service';

@Module({
    imports: [ChatModule],
    controllers: [Step3Controller],
    providers: [Step3Service],
})
export class Step3Module {}
