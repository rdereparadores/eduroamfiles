import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockWordDto } from './dto/unlock-word.dto';

const VALID_WORDS = ['la', 'contraseña', 'del', 'proyecto', 'alpha', 'es'];

@Injectable()
export class FinalPhraseService {
    constructor(private readonly prismaService: PrismaService) {}

    async unlock(userId: number, dto: UnlockWordDto) {
        if (!VALID_WORDS.includes(dto.word)) {
            throw new BadRequestException('Word not found');
        }

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;
        const phrase = progress.finalPhrase as { word: string; unlocked: boolean }[];
        const entry = phrase.find(p => p.word === dto.word);
        if (!entry) throw new BadRequestException('Word not found');

        entry.unlocked = true;
        await this.prismaService.user.update({ where: { id: userId }, data: { progress } });
        return { success: true };
    }
}
