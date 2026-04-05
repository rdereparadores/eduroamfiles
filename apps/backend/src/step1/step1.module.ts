import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { Step1Controller } from './step1.controller';
import { Step1Service } from './step1.service';

@Module({
    imports: [ChatModule],
    controllers: [Step1Controller],
    providers: [Step1Service],
})
export class Step1Module {}
