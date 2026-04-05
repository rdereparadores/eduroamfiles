import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Auth } from "../auth/decorators/auth.decorator";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get('')
    @Auth()
    getMe(@Req() req: Request) {
        const userId = (req as any).user.sub as number;
        return this.userService.findById(userId);
    }
}
