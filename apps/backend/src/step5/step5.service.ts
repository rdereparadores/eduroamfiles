import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnlockFolderDto } from './dto/unlock-folder.dto';

const FOLDER_PASSWORD = 'EPCC2026';

@Injectable()
export class Step5Service {
    constructor(private readonly prismaService: PrismaService) {}

    async unlock(userId: number, dto: UnlockFolderDto) {
        if (dto.password !== FOLDER_PASSWORD) {
            throw new ForbiddenException('Incorrect password');
        }

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        progress.steps.step5.substeps.folderUnlocked = true;
        progress.steps.step5.completed = true;

        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        return { success: true };
    }
}
