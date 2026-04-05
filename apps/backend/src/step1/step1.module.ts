import { Module } from '@nestjs/common';
import { Step1Service } from './step1.service';
import { Step1Controller } from './step1.controller';

@Module({
    controllers: [Step1Controller],
    providers: [Step1Service],
})
export class Step1Module {}
