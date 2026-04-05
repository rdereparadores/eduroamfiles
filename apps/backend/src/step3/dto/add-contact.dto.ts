import { IsString } from 'class-validator';

export class AddContactDto {
    @IsString()
    contact: string;
}
