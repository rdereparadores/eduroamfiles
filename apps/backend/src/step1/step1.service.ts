import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { MessageRole } from '../chat/dto/add-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockStep1Dto } from './dto/unlock-step1.dto';

const STEP1_PASSWORD = 'indescifrable';

@Injectable()
export class Step1Service {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly chatService: ChatService,
    ) {}

    async unlock(userId: number, dto: UnlockStep1Dto) {
        if (dto.password !== STEP1_PASSWORD) {
            throw new ForbiddenException('Incorrect password');
        }

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        const alreadyUnlocked = progress.steps.step1.substeps.whatsappUnlocked === true;

        progress.steps.step1.substeps.whatsappUnlocked = true;
        progress.steps.step1.completed = true;

        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        if (!alreadyUnlocked) {
            const chat = await this.chatService.create({
                userId,
                botName: 'Pedro L.',
                botImgUrl: '',
            });
            await this.chatService.addMessage(chat.id, { role: MessageRole.BOT, content: 'Escucha' });
            await this.chatService.addMessage(chat.id, { role: MessageRole.BOT, content: '', fileUrl: 'https://eduroamfiles.t3.tigrisfiles.io/file_example_MP3_1MG.mp3' });
        }

        return { success: true };
    }
}
