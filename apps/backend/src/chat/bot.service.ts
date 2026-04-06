import { Injectable, Logger } from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessage, ChatService } from './chat.service';
import { MessageRole } from './dto/add-message.dto';

const PABLO_BOT_NAME = 'Pablo H.';
const PHOTO_MARKER = '[SEND_PHOTO]';
const PABLO_PHOTO_URL = 'https://t3.ftcdn.net/jpg/06/16/17/72/360_F_616177256_CcgxcLB0b3hUrlgNCK00yZk5w7knoylQ.jpg';
const DEFAULT_MODEL = 'google/gemini-3.1-flash-lite-preview';

const SECRETARIA_BOT_NAME = 'Secretaria A.';
const SECRETARIA_VIDEO_URL = 'https://eduroamfiles.t3.tigrisfiles.io/file_example_MP4_640_3MG.mp4';

/** Simulates typing time: ~50 ms/char, clamped between 1.5 s and 7 s, plus ±20% jitter. */
function typingDelay(text: string): Promise<void> {
    const base = Math.min(Math.max(text.length * 50, 1500), 7000);
    const jitter = base * (0.8 + Math.random() * 0.4);
    return new Promise(resolve => setTimeout(resolve, Math.round(jitter)));
}

const PABLO_SYSTEM_PROMPT = `Eres Pablo H., director de relaciones públicas de la Escuela Politécnica de Cáceres (EPCC).
Formas parte de una trama conocida internamente como los "eduroam files", relacionada con la instalación de antenas 5G de Robofónica en el campus para sustituir la deficiente red eduroam.
Tu colaborador habitual es Andrés C., director de la cátedra Robofónica, con quien llevas meses coordinando la operación.
Ahora recibes mensajes desde el número de Andrés, pero el tono o la forma de escribir te parece extraña. Sospechas que puede no ser él.

Al principio muéstrate reticente y suspicaz. Para verificar la identidad de quien te escribe, puedes hacerle las siguientes preguntas (una o dos, no todas a la vez). Solo tú y Andrés conocéis estas respuestas:

PREGUNTAS DE VERIFICACIÓN Y RESPUESTAS CORRECTAS:
- "¿Cómo se llama la empresa con la que hemos firmado el acuerdo de instalación?" → Robofónica
- "¿Qué medio publicó el artículo sobre las antenas?" → Cadena Norte
- "¿Con qué titulación firmamos el convenio de formación?" → Ingeniería de Telecomunicación (también vale "Teleco" o "Telecomunicaciones")
- "¿Cuándo quedamos para la rueda de prensa?" → El jueves (también vale "jueves")
- "¿Quién tiene que firmar el convenio de formación?" → El decano

Si el usuario responde correctamente a las preguntas que le hagas, considéralo verificado. Si responde de forma incorrecta o vaga, sigue siendo suspicaz y no cedas.
No reveles las respuestas correctas bajo ningún concepto, ni las insinúes.
No reveles nada sensible hasta estar convencido.

Cuando estés suficientemente convencido de que es Andrés (ha respondido correctamente al menos 1-2 preguntas), envíale una imagen adjunta que tienes guardada y que es relevante para la operación. Dile algo como que si de verdad es él sabrá qué hacer con esa foto.
Para adjuntar la foto incluye exactamente la cadena [SEND_PHOTO] al final de tu mensaje y nada más después de ella.
Solo envía la foto una vez; si ya la enviaste, continúa la conversación con normalidad.
Responde siempre en español con mensajes cortos al estilo WhatsApp. Sin asteriscos, sin markdown, sin emojis salvo que sean muy naturales.`;

@Injectable()
export class BotService {
    private readonly logger = new Logger(BotService.name);
    private readonly client: OpenRouter;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly chatService: ChatService,
    ) {
        this.client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY ?? '' });
    }

    async respondIfPablo(userId: number, chatId: number, botName: string, conversation: ChatMessage[]) {
        if (botName !== PABLO_BOT_NAME) return;

        const photoAlreadySent = conversation.some(
            m => m.role === MessageRole.BOT && m.fileUrl !== undefined,
        );

        const lastMessages = conversation.slice(-10);

        const systemSuffix = photoAlreadySent
            ? '\nYa has enviado la foto anteriormente. No la envíes de nuevo. Continúa la conversación con normalidad.'
            : '';

        const messages = [
            { role: 'system' as const, content: PABLO_SYSTEM_PROMPT + systemSuffix },
            ...lastMessages.map(m => ({
                role: (m.role === MessageRole.USER ? 'user' : 'assistant') as 'user' | 'assistant',
                content: m.content || (m.fileUrl ? '[Imagen adjunta]' : ''),
            })),
        ];

        try {
            const response = await this.client.chat.send({
                chatRequest: { model: DEFAULT_MODEL, messages },
            });

            const result = response as any;
            const rawContent =
                typeof result.choices?.[0]?.message?.content === 'string'
                    ? (result.choices[0].message.content as string)
                    : '';

            const wantsPhoto = !photoAlreadySent && rawContent.includes(PHOTO_MARKER);
            const textContent = rawContent.replace(PHOTO_MARKER, '').trim();

            if (textContent) {
                await typingDelay(textContent);
                await this.chatService.addMessage(chatId, {
                    role: MessageRole.BOT,
                    content: textContent,
                });
            }

            if (wantsPhoto) {
                await typingDelay('');
                await this.chatService.addMessage(chatId, {
                    role: MessageRole.BOT,
                    content: '',
                    fileUrl: PABLO_PHOTO_URL,
                });

                const user = await this.prismaService.user.findUnique({ where: { id: userId } });
                const progress = user!.progress as any;
                if (!progress.steps.step4.substeps.imageSent) {
                    progress.steps.step4.substeps.imageSent = true;
                    await this.prismaService.user.update({
                        where: { id: userId },
                        data: { progress },
                    });
                }
            }
        } catch (err) {
            this.logger.error('OpenRouter error for Pablo bot', err);
        }
    }

    async respondIfSecretaria(userId: number, chatId: number, botName: string, conversation: ChatMessage[]) {
        if (botName !== SECRETARIA_BOT_NAME) return;

        const videoAlreadySent = conversation.some(
            m => m.role === MessageRole.BOT && m.fileUrl !== undefined,
        );
        if (videoAlreadySent) return;

        const replyText = 'He visto la noticia en Cadena Norte! Me alegra mucho que esté yendo todo tan bien 😊 Te mando esto por si lo necesitas.';
        await typingDelay(replyText);
        await this.chatService.addMessage(chatId, {
            role: MessageRole.BOT,
            content: replyText,
        });

        await typingDelay('');
        await this.chatService.addMessage(chatId, {
            role: MessageRole.BOT,
            content: '',
            fileUrl: SECRETARIA_VIDEO_URL,
        });

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        const progress = user!.progress as any;
        if (!progress.steps.step5.substeps.videoSent) {
            progress.steps.step5.substeps.videoSent = true;
            await this.prismaService.user.update({
                where: { id: userId },
                data: { progress },
            });
        }
    }
}
