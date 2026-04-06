import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { BotService } from './bot.service';

@Module({
    controllers: [ChatController],
    providers: [ChatService, BotService],
    exports: [ChatService],
})
export class ChatModule {}
