import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MessageRole {
    USER = 'user',
    BOT = 'bot',
}

export class AddMessageDto {
    @IsEnum(MessageRole)
    role: MessageRole;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    fileUrl?: string;
}
