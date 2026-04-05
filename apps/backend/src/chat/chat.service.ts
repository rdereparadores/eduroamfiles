import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
    createdAt: string;
}

@Injectable()
export class ChatService {
    constructor(private readonly prismaService: PrismaService) {}

    create(createChatDto: CreateChatDto) {
        return this.prismaService.chat.create({
            data: {
                userId: createChatDto.userId,
                botName: createChatDto.botName,
                botImgUrl: createChatDto.botImgUrl,
                conversation: [],
            },
        });
    }

    findAllByUser(userId: number) {
        return this.prismaService.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const chat = await this.prismaService.chat.findUnique({ where: { id } });
        if (!chat) throw new NotFoundException(`Chat #${id} not found`);
        return chat;
    }

    async update(id: number, data: Partial<Pick<CreateChatDto, 'botName' | 'botImgUrl'>>) {
        await this.findOne(id);
        return this.prismaService.chat.update({ where: { id }, data });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prismaService.chat.delete({ where: { id } });
    }

    async addMessage(id: number, addMessageDto: AddMessageDto) {
        const chat = await this.findOne(id);

        const message: ChatMessage = {
            role: addMessageDto.role,
            content: addMessageDto.content,
            createdAt: new Date().toISOString(),
        };

        const conversation = (chat.conversation as unknown as ChatMessage[]) ?? [];
        conversation.push(message);

        return this.prismaService.chat.update({
            where: { id },
            data: { conversation: conversation as any },
        });
    }
}
