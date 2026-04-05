import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockStep1Dto } from './dto/unlock-step1.dto';

const STEP1_PASSWORD = 'indescifrable';

@Injectable()
export class Step1Service {
    constructor(private readonly prismaService: PrismaService) {}

    async unlock(userId: number, dto: UnlockStep1Dto) {
        if (dto.password !== STEP1_PASSWORD) {
            throw new ForbiddenException('Incorrect password');
        }

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        progress.steps.step1.substeps.whatsappUnlocked = true;
        progress.steps.step1.completed = true;

        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        return { success: true };
    }
}
