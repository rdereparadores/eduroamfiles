import { IsInt, IsString, IsUrl } from 'class-validator';

export class CreateChatDto {
    @IsInt()
    userId: number;

    @IsString()
    botName: string;

    @IsUrl()
    botImgUrl: string;
}
