import { IsString } from 'class-validator';

export class UnlockFolderDto {
    @IsString()
    password: string;
}
