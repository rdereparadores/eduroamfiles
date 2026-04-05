import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Step2Service {
    constructor(private readonly prismaService: PrismaService) {}

    async urlAccessed(userId: number) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        progress.steps.step2.substeps.urlAccessed = true;
        progress.steps.step2.completed = true;

        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        return { success: true };
    }
}
