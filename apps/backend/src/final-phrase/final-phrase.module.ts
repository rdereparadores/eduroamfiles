import { Module } from '@nestjs/common';
import { FinalPhraseController } from './final-phrase.controller';
import { FinalPhraseService } from './final-phrase.service';

@Module({
    controllers: [FinalPhraseController],
    providers: [FinalPhraseService],
})
export class FinalPhraseModule {}
