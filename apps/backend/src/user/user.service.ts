import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const existing = await this.prismaService.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existing) throw new ConflictException('Email already registered');

        const passwordHash = await argon2.hash(createUserDto.password);
        const user = await this.prismaService.user.create({
            data: {
                email: createUserDto.email,
                passwordHash,
                progress: {
                    steps: {
                        step1: {
                            substeps: {
                                whatsappUnlocked: false
                            },
                            completed: false
                        },
                        step2: {
                            substeps: {
                                urlAccessed: false
                            },
                            completed: false
                        },
                        step3: {
                            substeps: {
                                pabloContactUnlocked: false
                            },
                            completed: false
                        },
                        step4: {
                            substeps: {
                                imageSent: false,
                                secretariaContactUnlocked: false
                            },
                            completed: false
                        },
                        step5: {
                            substeps: {
                                videoSent: false,
                                folderUnlocked: false
                            },
                            completed: false
                        }
                    },
                    finalPhrase: [
                        { "word": "la", "unlocked": false},
                        { "word": "contraseña", "unlocked": false},
                        { "word": "del", "unlocked": false},
                        { "word": "proyecto", "unlocked": false},
                        { "word": "alpha", "unlocked": false},
                        { "word": "es", "unlocked": false}
                    ]
                },
            },
        });

        const { passwordHash: _, ...result } = user;
        return result;
    }

    findByEmail(email: string) {
        return this.prismaService.user.findUnique({ where: { email } });
    }

    async findById(id: number) {
        const user = await this.prismaService.user.findUnique({ where: { id } });
        const { passwordHash: _, ...result } = user!;
        return result;
    }
}