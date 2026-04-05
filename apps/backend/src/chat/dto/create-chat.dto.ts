import { IsInt, IsString } from 'class-validator';

export class CreateChatDto {
    @IsInt()
    userId: number;

    @IsString()
    botName: string;

    @IsString()
    botImgUrl: string;
}
