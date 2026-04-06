import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { BotService } from './bot.service';
import { ChatMessage, ChatService } from './chat.service';
import { AddMessageDto, MessageRole } from './dto/add-message.dto';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly botService: BotService,
    ) {}

    @Get()
    @Auth()
    findAll(@Req() req: Request) {
        const userId = (req as any).user.sub as number;
        return this.chatService.findAllByUser(userId);
    }

    @Get(':id')
    @Auth()
    async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const userId = (req as any).user.sub as number;
        const chat = await this.chatService.findOne(id);
        if (chat.userId !== userId) throw new ForbiddenException();
        return chat;
    }

    @Post(':id/message')
    @Auth()
    async addMessage(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AddMessageDto,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.sub as number;
        const chat = await this.chatService.findOne(id);
        if (chat.userId !== userId) throw new ForbiddenException();

        const updatedChat = await this.chatService.addMessage(id, { ...dto, role: MessageRole.USER });

        // Fire-and-forget bot response (appears on next poll)
        const conversation = updatedChat.conversation as unknown as ChatMessage[];
        this.botService.respondIfPablo(userId, id, chat.botName, conversation).catch(() => {});
        this.botService.respondIfSecretaria(userId, id, chat.botName, conversation).catch(() => {});

        return updatedChat;
    }
}
