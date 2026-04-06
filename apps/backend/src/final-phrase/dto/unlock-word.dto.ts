import { IsString } from 'class-validator';

export class UnlockWordDto {
    @IsString()
    word: string;
}
