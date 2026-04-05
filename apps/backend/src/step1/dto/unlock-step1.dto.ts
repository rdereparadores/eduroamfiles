import { IsString } from 'class-validator';

export class UnlockStep1Dto {
    @IsString()
    password: string;
}
