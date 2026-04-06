import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { MessageRole } from '../chat/dto/add-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddContactDto } from './dto/add-contact.dto';

const PABLO_HANDLE = 'pablohepcc';
const SECRETARIA_PHONE = '927257195';

const SECRETARIA_CONVERSATION: { role: MessageRole; content: string; createdAt: string }[] = [
    { role: MessageRole.BOT,  content: 'Andrés, ¿cómo va todo con el tema de las antenas?', createdAt: '2026-04-01T09:02:00.000Z' },
    { role: MessageRole.USER, content: 'Bien, ya firmamos con Robofónica. Esta semana empiezan con la instalación en el ala norte.', createdAt: '2026-04-01T09:03:44.000Z' },
    { role: MessageRole.BOT,  content: 'Perfecto. El decano está nervioso, quiere que todo quede fuera de las actas del consejo.', createdAt: '2026-04-01T09:04:22.000Z' },
    { role: MessageRole.USER, content: 'Entendido. Pablo ya se ha encargado de que los medios lo traten como un acuerdo de formación, no como sustitución de infraestructura.', createdAt: '2026-04-01T09:05:10.000Z' },
    { role: MessageRole.BOT,  content: 'Mejor así. ¿Y el contrato con Robofónica? ¿Firmado por las dos partes?', createdAt: '2026-04-01T09:06:05.000Z' },
    { role: MessageRole.USER, content: 'Firmado y archivado. Solo existe copia física, como acordamos.', createdAt: '2026-04-01T09:07:33.000Z' },
    { role: MessageRole.BOT,  content: 'Bien. Si alguien pregunta, el convenio de formación es lo único que existe oficialmente.', createdAt: '2026-04-01T09:08:18.000Z' },
    { role: MessageRole.USER, content: 'Exacto. El rector tampoco sabe los detalles técnicos, solo que habrá antenas nuevas.', createdAt: '2026-04-01T09:09:41.000Z' },
    { role: MessageRole.BOT,  content: '¿Y lo del informe de impacto electromagnético? ¿Está tramitado?', createdAt: '2026-04-01T09:10:55.000Z' },
    { role: MessageRole.USER, content: 'Robofónica tiene un peritaje propio pero mejor que no trascienda. Lo estamos gestionando esta semana.', createdAt: '2026-04-01T09:11:47.000Z' },
    { role: MessageRole.BOT,  content: 'Entendido. Cuando esté todo pactado te mando un mensaje.', createdAt: '2026-04-01T09:12:30.000Z' },
];

const PABLO_CONVERSATION: { role: MessageRole; content: string; createdAt: string }[] = [
    { role: MessageRole.BOT,  content: 'Buenas, ¿has tenido ocasión de ver el artículo de Cadena Norte sobre las antenas?', createdAt: '2026-04-02T10:15:00.000Z' },
    { role: MessageRole.USER, content: 'Sí, justo ahora. Ha quedado bastante bien cubierto.', createdAt: '2026-04-02T10:16:12.000Z' },
    { role: MessageRole.BOT,  content: 'Me alegra. Desde comunicación llevamos semanas coordinando con ellos para que el tono fuera el adecuado.', createdAt: '2026-04-02T10:17:04.000Z' },
    { role: MessageRole.USER, content: 'Se nota. Técnico pero accesible, justo lo que queríamos para llegar también al público general.', createdAt: '2026-04-02T10:18:30.000Z' },
    { role: MessageRole.BOT,  content: 'Exacto. Además, el rector me llamó ayer personalmente para trasladar la satisfacción de la dirección de la EPCC.', createdAt: '2026-04-02T10:19:55.000Z' },
    { role: MessageRole.USER, content: 'Buena señal. ¿Cómo va el plan para la rueda de prensa del jueves?', createdAt: '2026-04-02T10:21:10.000Z' },
    { role: MessageRole.BOT,  content: 'Todo cerrado. He confirmado a tres medios locales y a dos agencias. ¿Puedes llevar el informe técnico del despliegue?', createdAt: '2026-04-02T10:22:33.000Z' },
    { role: MessageRole.USER, content: 'Por supuesto. Lo preparo con los datos de cobertura y velocidades estimadas por zona del campus.', createdAt: '2026-04-02T10:23:47.000Z' },
    { role: MessageRole.BOT,  content: 'Perfecto. Ah, ¿y lo del convenio de formación con los estudiantes de Ingeniería de Telecomunicación?', createdAt: '2026-04-02T10:25:02.000Z' },
    { role: MessageRole.USER, content: 'Ya está redactado. Solo falta la firma del decano, que tiene previsto firmar esta semana.', createdAt: '2026-04-02T10:26:18.000Z' },
    { role: MessageRole.BOT,  content: 'Ese detalle va a ser el punto más potente del mensaje hacia el exterior. Los medios lo van a destacar por encima de lo técnico.', createdAt: '2026-04-02T10:27:40.000Z' },
    { role: MessageRole.USER, content: 'Cuento con ello. Nos vemos el jueves entonces.', createdAt: '2026-04-02T10:28:05.000Z' },
    { role: MessageRole.BOT,  content: 'Sin falta. Suerte con el despliegue esta semana.', createdAt: '2026-04-02T10:28:31.000Z' },
];

@Injectable()
export class Step3Service {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly chatService: ChatService,
    ) {}

    async addContact(userId: number, dto: AddContactDto) {
        const handle = dto.contact.trim().replace(/^@/, '').toLowerCase();

        if (handle === SECRETARIA_PHONE) {
            return this.addSecretaria(userId);
        }

        if (handle !== PABLO_HANDLE) {
            throw new BadRequestException('Contacto no encontrado');
        }

        return this.addPablo(userId);
    }

    private async addPablo(userId: number) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        if (progress.steps.step3.substeps.pabloContactUnlocked) {
            return { success: true, alreadyAdded: true };
        }

        const chat = await this.chatService.create({
            userId,
            botName: 'Pablo H.',
            botImgUrl: '',
        });

        for (const msg of PABLO_CONVERSATION) {
            await this.chatService.addMessage(chat.id, msg);
        }

        progress.steps.step3.substeps.pabloContactUnlocked = true;
        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        return { success: true, alreadyAdded: false };
    }

    private async addSecretaria(userId: number) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;

        if (progress.steps.step4.substeps.secretariaContactUnlocked) {
            return { success: true, alreadyAdded: true };
        }

        const chat = await this.chatService.create({
            userId,
            botName: 'Secretaria A.',
            botImgUrl: '',
        });

        for (const msg of SECRETARIA_CONVERSATION) {
            await this.chatService.addMessage(chat.id, msg);
        }

        progress.steps.step4.substeps.secretariaContactUnlocked = true;
        await this.prismaService.user.update({
            where: { id: userId },
            data: { progress },
        });

        return { success: true, alreadyAdded: false };
    }
}
