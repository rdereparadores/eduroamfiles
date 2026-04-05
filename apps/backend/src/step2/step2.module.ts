import { Module } from '@nestjs/common';
import { Step2Controller } from './step2.controller';
import { Step2Service } from './step2.service';

@Module({
    controllers: [Step2Controller],
    providers: [Step2Service],
})
export class Step2Module {}
