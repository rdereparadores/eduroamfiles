import { Module } from '@nestjs/common';
import { Step5Controller } from './step5.controller';
import { Step5Service } from './step5.service';

@Module({
    controllers: [Step5Controller],
    providers: [Step5Service],
})
export class Step5Module {}
